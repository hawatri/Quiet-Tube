"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Music, Youtube, Search } from "lucide-react";
import type { Song, Playlist } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { getYoutubeVideoDetails } from "@/ai/flows/youtube";

interface SearchResult {
    song: Song;
    playlist: Playlist;
}

export default function SongSearchBar() {
    const { playlists, playTrack, activePlaylist, addSongToPlaylist } = usePlayer();
    const [searchQuery, setSearchQuery] = useState("");
    const [isPopoverOpen, setPopoverOpen] = useState(false);
    const { toast } = useToast();
    const inputRef = useRef<HTMLInputElement>(null);
     const [isFetching, setIsFetching] = useState(false);

    const isYouTubeUrl = useMemo(() => {
        if (!searchQuery.startsWith("https://")) return false;
        try {
            const url = new URL(searchQuery);
            return url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be");
        } catch (_) {
            return false;
        }
    }, [searchQuery]);

    const searchResults: SearchResult[] = useMemo(() => {
        if (searchQuery.trim().length < 2 || isYouTubeUrl) {
            return [];
        }

        const lowercasedQuery = searchQuery.toLowerCase();
        const results: SearchResult[] = [];

        playlists.forEach(playlist => {
            playlist.songs.forEach(song => {
                if (song.title.toLowerCase().includes(lowercasedQuery)) {
                    results.push({ song, playlist });
                }
            });
        });

        return results.slice(0, 5);
    }, [searchQuery, playlists, isYouTubeUrl]);
    
    const urlAlreadyInPlaylist = useMemo(() => {
        if (!isYouTubeUrl) return false;
        return playlists.some(p => p.songs.some(s => s.url === searchQuery));
    }, [isYouTubeUrl, searchQuery, playlists]);

    const handleSelectSong = (result: SearchResult) => {
        const trackIndex = result.playlist.songs.findIndex(s => s.id === result.song.id);
        if (trackIndex !== -1) {
            playTrack(result.playlist.id, trackIndex);
            setSearchQuery("");
            setPopoverOpen(false);
        }
    };

    const handlePlayFromUrl = async () => {
        if (!isYouTubeUrl || !activePlaylist) return;
        
        setIsFetching(true);
        setPopoverOpen(false);
        const loadingToast = toast({ title: "Getting song details..." });

        try {
            const { title } = await getYoutubeVideoDetails(searchQuery);
            const newSong = addSongToPlaylist(activePlaylist.id, { title, url: searchQuery });
            
            if (newSong) {
                const newSongIndex = activePlaylist.songs.findIndex(s => s.id === newSong.id);
                 if (newSongIndex !== -1) {
                    playTrack(activePlaylist.id, newSongIndex);
                }
            }

            loadingToast.dismiss();
            toast({ title: "Now Playing", description: title });
            setSearchQuery("");

        } catch (error) {
            loadingToast.dismiss();
            toast({ variant: "destructive", title: "Could not play song", description: "Failed to fetch video details from YouTube." });
            console.error(error);
        } finally {
            setIsFetching(false);
        }
    }

    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            setPopoverOpen(true);
        } else {
            setPopoverOpen(false);
        }
    }, [searchQuery, searchResults.length, isYouTubeUrl]);
    
    // Close popover if clicked outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setPopoverOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild className="w-full">
                <div className="relative">
                    <Search className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        type="search"
                        placeholder="Search or paste YouTube URL..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => { if(searchQuery) setPopoverOpen(true)}}
                        className="pl-7 md:pl-9 h-8 md:h-10 text-sm"
                        disabled={isFetching}
                    />
                </div>
            </PopoverTrigger>
            <PopoverContent 
                className="w-[--radix-popover-trigger-width] p-0 bg-card/95 backdrop-blur-xl border border-border/50 shadow-lg" 
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <Command className="bg-transparent">
                    {isYouTubeUrl && !urlAlreadyInPlaylist && (
                            <CommandItem onSelect={handlePlayFromUrl} className="cursor-pointer">
                            <Youtube className="mr-2 h-3 w-3 md:h-4 md:w-4 text-red-500" />
                            <span>Play from YouTube</span>
                        </CommandItem>
                    )}
                        {isYouTubeUrl && urlAlreadyInPlaylist && (
                            <CommandItem disabled className="cursor-not-allowed text-muted-foreground">
                            <Youtube className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                            <span>Song is already in a playlist</span>
                        </CommandItem>
                    )}
                    {searchResults.length > 0 && (
                        <CommandGroup heading="Songs in your playlists">
                            {searchResults.map(result => (
                                <CommandItem key={result.song.id} onSelect={() => handleSelectSong(result)} className="cursor-pointer">
                                    <Music className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                                    <div className="flex-1 truncate">
                                        <p className="truncate text-sm">{result.song.title}</p>
                                        <p className="text-xs text-muted-foreground truncate">{result.playlist.name}</p>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                    <CommandEmpty>
                        {searchQuery.trim().length > 1 && !isYouTubeUrl && !isFetching && "No songs found."}
                            {isFetching && "Fetching..."}
                            {searchQuery.trim().length > 1 && !isYouTubeUrl && !searchResults.length && !isFetching && (
                            <div className="p-3 md:p-4 text-xs md:text-sm text-center text-muted-foreground">
                                No songs found. Try pasting a YouTube URL.
                            </div>
                        )}
                    </CommandEmpty>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
