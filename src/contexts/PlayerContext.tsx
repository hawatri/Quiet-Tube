"use client";

import { createContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import type { Playlist, Song } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const SongSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
});

const PlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  songs: z.array(SongSchema),
});

const PlaylistsSchema = z.array(PlaylistSchema);

export interface PlayerContextType {
  playlists: Playlist[];
  activePlaylistId: string | null;
  currentTrackIndex: number | null;
  isPlaying: boolean;
  volume: number;
  loop: boolean;
  isShuffled: boolean;
  currentTrack: Song | null;
  activePlaylist: Playlist | null;
  createPlaylist: (name: string) => void;
  deletePlaylist: (playlistId: string) => void;
  updatePlaylistName: (playlistId: string, newName: string) => void;
  addSongToPlaylist: (playlistId: string, song: Omit<Song, "id">) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  selectPlaylist: (playlistId: string | null) => void;
  playTrack: (playlistId: string, trackIndex: number) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setVolume: (volume: number) => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  setCurrentTrackIndex: (index: number | null) => void;
  exportPlaylists: () => void;
  importPlaylists: (file: File) => void;
}

export const PlayerContext = createContext<PlayerContextType | null>(null);

const STORAGE_KEY = "quietTubePlaylists";

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [loop, setLoop] = useState<boolean>(false);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const shuffleOrder = useRef<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedPlaylists = localStorage.getItem(STORAGE_KEY);
      if (storedPlaylists) {
        const parsed = JSON.parse(storedPlaylists);
        const validation = PlaylistsSchema.safeParse(parsed);
        if (validation.success) {
          setPlaylists(validation.data);
          if (validation.data.length > 0) {
            setActivePlaylistId(validation.data[0].id);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load playlists from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
    } catch (error) {
      console.error("Failed to save playlists to localStorage", error);
    }
  }, [playlists]);
  
  const activePlaylist = playlists.find(p => p.id === activePlaylistId) ?? null;
  const currentTrack = (activePlaylist && currentTrackIndex !== null) ? activePlaylist.songs[currentTrackIndex] : null;

  const generateShuffleOrder = useCallback((songCount: number) => {
    const order = Array.from({ length: songCount }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    shuffleOrder.current = order;
  }, []);

  const selectPlaylist = (playlistId: string | null) => {
    setActivePlaylistId(playlistId);
    setCurrentTrackIndex(null);
    setIsPlaying(false);
  };
  
  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name,
      songs: [],
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    if (!activePlaylistId) {
      setActivePlaylistId(newPlaylist.id);
    }
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    if (activePlaylistId === playlistId) {
      const remainingPlaylists = playlists.filter(p => p.id !== playlistId);
      selectPlaylist(remainingPlaylists.length > 0 ? remainingPlaylists[0].id : null);
    }
  };

  const updatePlaylistName = (playlistId: string, newName: string) => {
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, name: newName } : p));
  };

  const addSongToPlaylist = (playlistId: string, song: Omit<Song, "id">) => {
    const newSong: Song = { ...song, id: crypto.randomUUID() };
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, songs: [...p.songs, newSong] } : p));
  };
  
  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id !== playlistId) return p;
      return { ...p, songs: p.songs.filter(s => s.id !== songId) };
    }));
  };

  const playTrack = (playlistId: string, trackIndex: number) => {
    if (activePlaylistId !== playlistId) {
      setActivePlaylistId(playlistId);
    }
    setCurrentTrackIndex(trackIndex);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (currentTrack) {
      setIsPlaying(prev => !prev);
    }
  };

  const playNext = useCallback(() => {
    if (!activePlaylist || currentTrackIndex === null) return;
  
    if (isShuffled) {
      const currentShuffleIndex = shuffleOrder.current.indexOf(currentTrackIndex);
      const nextShuffleIndex = (currentShuffleIndex + 1) % shuffleOrder.current.length;
      setCurrentTrackIndex(shuffleOrder.current[nextShuffleIndex]);
    } else {
      const nextIndex = (currentTrackIndex + 1) % activePlaylist.songs.length;
      setCurrentTrackIndex(nextIndex);
    }
    setIsPlaying(true);
  }, [activePlaylist, currentTrackIndex, isShuffled]);

  const playPrevious = () => {
    if (!activePlaylist || currentTrackIndex === null) return;
  
    if (isShuffled) {
      const currentShuffleIndex = shuffleOrder.current.indexOf(currentTrackIndex);
      const prevShuffleIndex = (currentShuffleIndex - 1 + shuffleOrder.current.length) % shuffleOrder.current.length;
      setCurrentTrackIndex(shuffleOrder.current[prevShuffleIndex]);
    } else {
      const prevIndex = (currentTrackIndex - 1 + activePlaylist.songs.length) % activePlaylist.songs.length;
      setCurrentTrackIndex(prevIndex);
    }
    setIsPlaying(true);
  };

  const toggleLoop = () => setLoop(prev => !prev);

  const toggleShuffle = () => {
    setIsShuffled(prev => {
      const newShuffleState = !prev;
      if (newShuffleState && activePlaylist) {
        generateShuffleOrder(activePlaylist.songs.length);
      } else {
        shuffleOrder.current = [];
      }
      return newShuffleState;
    });
  };

  const exportPlaylists = () => {
    const dataStr = JSON.stringify(playlists, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.download = "quiet-tube-playlists.json";
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Playlists exported successfully!" });
  };

  const importPlaylists = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File could not be read");
        const json = JSON.parse(text);
        const validation = PlaylistsSchema.safeParse(json);
        if (validation.success) {
          setPlaylists(validation.data);
          selectPlaylist(validation.data.length > 0 ? validation.data[0].id : null);
          toast({ title: "Playlists imported successfully!" });
        } else {
          throw new Error(validation.error.message);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Import failed",
          description: "The selected file is not a valid playlist file.",
        });
        console.error("Import error:", error);
      }
    };
    reader.readAsText(file);
  };

  const value: PlayerContextType = {
    playlists,
    activePlaylistId,
    currentTrackIndex,
    isPlaying,
    volume,
    loop,
    isShuffled,
    currentTrack,
    activePlaylist,
    createPlaylist,
    deletePlaylist,
    updatePlaylistName,
    addSongToPlaylist,
    removeSongFromPlaylist,
    selectPlaylist,
    playTrack,
    togglePlay,
    playNext,
    playPrevious,
    setVolume,
    toggleLoop,
    toggleShuffle,
    setCurrentTrackIndex,
    exportPlaylists,
    importPlaylists,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
