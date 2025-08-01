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
  progress: number;
  duration: number;
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
  exportPlaylists: (playlistId?: string) => void;
  importPlaylists: (files: File[]) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  seek: (seconds: number) => void;
  playerRef: React.RefObject<any>;
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
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const shuffleOrder = useRef<number[]>([]);
  const playerRef = useRef<any>(null);
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
      
      const songToRemove = p.songs.find(s => s.id === songId);
      const isCurrentTrack = songToRemove && currentTrack && songToRemove.id === currentTrack.id;

      const newSongs = p.songs.filter(s => s.id !== songId);

      if(isCurrentTrack) {
        setIsPlaying(false);
        setCurrentTrackIndex(null);
      }
      
      return { ...p, songs: newSongs };
    }));
  };

  const playTrack = (playlistId: string, trackIndex: number) => {
    if (activePlaylistId !== playlistId) {
      setActivePlaylistId(playlistId);
    }
    setCurrentTrackIndex(trackIndex);
    setProgress(0);
    setDuration(0);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (currentTrack) {
      setIsPlaying(prev => !prev);
    }
  };

  const playNext = useCallback(() => {
    if (!activePlaylist || currentTrackIndex === null || activePlaylist.songs.length === 0) return;
  
    // If not looping and it's the last song, stop playback.
    if (!loop && !isShuffled && currentTrackIndex === activePlaylist.songs.length - 1) {
        setIsPlaying(false);
        return;
    }
    
    if (isShuffled) {
      const currentShuffleIndex = shuffleOrder.current.indexOf(currentTrackIndex);
      // If not looping and it's the last shuffled song, stop playback.
      if (!loop && currentShuffleIndex === shuffleOrder.current.length - 1) {
          setIsPlaying(false);
          return;
      }
      const nextShuffleIndex = (currentShuffleIndex + 1) % shuffleOrder.current.length;
      setCurrentTrackIndex(shuffleOrder.current[nextShuffleIndex]);
    } else {
      const nextIndex = (currentTrackIndex + 1) % activePlaylist.songs.length;
      setCurrentTrackIndex(nextIndex);
    }
    setProgress(0);
    setDuration(0);
    setIsPlaying(true);
  }, [activePlaylist, currentTrackIndex, isShuffled, loop]);

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
    setProgress(0);
    setDuration(0);
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

  const seek = (seconds: number) => {
    if (playerRef.current) {
        playerRef.current.seekTo(seconds, 'seconds');
        setProgress(seconds);
    }
  }

  const exportPlaylists = (playlistId?: string) => {
    let dataToExport: Playlist[] | Playlist | null = null;
    let filename = "quiet-tube-playlists.music";

    if (playlistId) {
        dataToExport = playlists.find(p => p.id === playlistId) ?? null;
        if (dataToExport) {
            filename = `${dataToExport.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.music`;
        }
    } else {
        dataToExport = playlists;
    }

    if (!dataToExport || (Array.isArray(dataToExport) && dataToExport.length === 0)) {
        toast({ variant: "destructive", title: "Nothing to export." });
        return;
    }

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Playlist(s) downloaded successfully!" });
  };

  const importPlaylists = (files: File[]) => {
    let importedPlaylists: Playlist[] = [];
    let failedFiles: string[] = [];
    
    const readerPromises = files.map(file => new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result;
            if (typeof text !== 'string') throw new Error("File could not be read");
            const json = JSON.parse(text);
            
            const toValidate = Array.isArray(json) ? json : [json];
            const validation = PlaylistsSchema.safeParse(toValidate.map(p => ({
                ...p,
                id: p.id || crypto.randomUUID(),
                songs: p.songs ? p.songs.map((s: any) => ({...s, id: s.id || crypto.randomUUID()})) : []
            })));

            if (validation.success) {
                importedPlaylists = [...importedPlaylists, ...validation.data];
            } else {
               failedFiles.push(file.name);
            }
          } catch (error) {
            failedFiles.push(file.name);
          } finally {
            resolve();
          }
        };
        reader.onerror = () => {
            failedFiles.push(file.name);
            resolve();
        }
        reader.readAsText(file);
    }));

    Promise.all(readerPromises).then(() => {
        if (importedPlaylists.length > 0) {
            setPlaylists(prev => {
                const existingIds = new Set(prev.map(p => p.id));
                const newPlaylists = importedPlaylists.filter(p => !existingIds.has(p.id));
                return [...prev, ...newPlaylists];
            });

            if (!activePlaylistId && importedPlaylists.length > 0) {
                selectPlaylist(importedPlaylists[0].id);
            }
            toast({ title: "Playlists imported successfully!", description: `${importedPlaylists.length} playlists added.` });
        }

        if (failedFiles.length > 0) {
            toast({
              variant: "destructive",
              title: "Some files failed to import",
              description: `Could not import: ${failedFiles.join(', ')}`,
            });
        }
        
        if (importedPlaylists.length === 0 && files.length > 0) {
             toast({
              variant: "destructive",
              title: "Import failed",
              description: "No valid playlist files were selected.",
            });
        }
    });
  };

  const value: PlayerContextType = {
    playlists,
    activePlaylistId,
    currentTrackIndex,
    isPlaying,
    volume,
    loop,
    isShuffled,
    progress,
    duration,
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
    setProgress,
    setDuration,
    seek,
    playerRef
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
