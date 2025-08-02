
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
import { Music, Youtube, PlusCircle, Search } from "lucide-react";
import type { Song, Playlist } from "@/types";
import { useToast } from "@/hooks/use-toast";

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

    const isYouTubeUrl = useMemo(() => {
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

        return results;
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

    const handleAddFromUrl = async () => {
        if (!activePlaylist) {
            toast({ variant: "destructive", title: "No active playlist", description: "Please select a playlist first."});
            return;
        }
        if (!isYouTubeUrl || urlAlreadyInPlaylist) return;

        try {
            // A simple way to get a title - this is a placeholder.
            // A real implementation might use a backend to fetch the YouTube video title.
            const title = `Song from URL: ${new URL(searchQuery).pathname}`;
            addSongToPlaylist(activePlaylist.id, { title, url: searchQuery });
            toast({ title: "Song Added", description: `Added from URL to ${activePlaylist.name}` });
            setSearchQuery("");
            setPopoverOpen(false);
        } catch (error) {
             toast({ variant: "destructive", title: "Invalid URL", description: "Could not add song from the provided URL."});
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        type="search"
                        placeholder="Search for a song..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => { if(searchQuery) setPopoverOpen(true)}}
                        className="pl-9"
                    />
                </div>
            </PopoverTrigger>
            <PopoverContent 
                className="w-[--radix-popover-trigger-width] p-0 bg-card/60 backdrop-blur-xl border-border" 
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <Command>
                    <CommandList>
                        {isYouTubeUrl && !urlAlreadyInPlaylist && (
                             <CommandItem onSelect={handleAddFromUrl} className="cursor-pointer">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                <span>Add from YouTube URL</span>
                            </CommandItem>
                        )}
                        {searchResults.length > 0 && (
                            <CommandGroup heading="Songs in your playlists">
                                {searchResults.map(result => (
                                    <CommandItem key={result.song.id} onSelect={() => handleSelectSong(result)} className="cursor-pointer">
                                        <Music className="mr-2 h-4 w-4" />
                                        <div className="flex-1 truncate">
                                            <p className="truncate">{result.song.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">{result.playlist.name}</p>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        <CommandEmpty>
                            {searchQuery.trim().length > 1 && !isYouTubeUrl && "No songs found."}
                            {isYouTubeUrl && urlAlreadyInPlaylist && "This song is already in a playlist."}
                        </CommandEmpty>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
