"use client";

import { useState } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Music, Play, Pause, Trash2, Plus, ListPlus } from "lucide-react";
import AddSongDialog from "./AddSongDialog";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";

export default function TrackList() {
  const {
    activePlaylist,
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    removeSongFromPlaylist,
    queueNext,
  } = usePlayer();
  const [isAddSongOpen, setAddSongOpen] = useState(false);

  if (!activePlaylist) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-card/60 backdrop-blur-xl rounded-lg m-4">
        <div className="w-full p-4 border-b border-border flex items-center justify-between md:hidden sticky top-0 bg-card/80 backdrop-blur-sm z-40 -mt-4 -ml-4 -mr-4 mb-4">
            <SidebarTrigger />
            <ThemeToggle />
        </div>
        <h2 className="text-2xl font-semibold">Welcome to QuietTube</h2>
        <p className="text-muted-foreground mt-2">
          Select a playlist or create a new one to get started.
        </p>
      </div>
    );
  }

  const handlePlayPause = (e: React.MouseEvent, trackId: string, index: number) => {
    e.stopPropagation();
    if (currentTrack?.id === trackId) {
      togglePlay();
    } else {
      playTrack(activePlaylist.id, index);
    }
  };

  return (
    <>
    <div className="flex-1 flex flex-col m-4 mt-0 mr-0 p-0 rounded-lg bg-card/60 backdrop-blur-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between md:hidden sticky top-0 bg-card/80 backdrop-blur-sm z-40 -mt-4 -ml-4 -mr-4 mb-4">
             <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h2 className="text-xl font-bold tracking-tight font-headline truncate">{activePlaylist.name}</h2>
             </div>
             <ThemeToggle />
        </div>
        <div className="hidden md:flex p-4 sm:p-6 lg:p-8 border-b border-border items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-headline">{activePlaylist.name}</h2>
                <p className="text-sm text-muted-foreground">{activePlaylist.songs.length} songs</p>
            </div>
            <Button onClick={() => setAddSongOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Song
            </Button>
        </div>


      <ScrollArea className="flex-1" style={{ paddingBottom: '96px' }}>
        {activePlaylist.songs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <h3 className="text-xl font-semibold">Playlist is empty</h3>
            <p className="text-muted-foreground mt-2">
              Add a song to get the party started!
            </p>
             <Button onClick={() => setAddSongOpen(true)} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Song
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="hidden md:table-header-group">
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-[100px] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activePlaylist.songs.map((song, index) => {
                const isActive = currentTrack?.id === song.id;
                return (
                  <TableRow
                    key={song.id}
                    onClick={() => playTrack(activePlaylist.id, index)}
                    className={cn("cursor-pointer", isActive && "bg-accent/80 hover:bg-accent/90")}
                  >
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handlePlayPause(e, song.id, index)}
                        className="h-8 w-8"
                      >
                        {isActive && isPlaying ? (
                          <Pause className="h-4 w-4 text-primary" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium truncate">{song.title}</div>
                      <div className="text-sm text-muted-foreground truncate hidden md:block">{song.url}</div>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            queueNext(song);
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        title="Play next"
                      >
                        <ListPlus className="h-4 w-4" />
                      </Button>
                       <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeSongFromPlaylist(activePlaylist.id, song.id)
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete song"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </ScrollArea>
      <div className="p-4 mt-auto md:hidden">
         <Button onClick={() => setAddSongOpen(true)} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add Song
        </Button>
      </div>
      </div>
      {isAddSongOpen && (
        <AddSongDialog isOpen={isAddSongOpen} setIsOpen={setAddSongOpen} />
      )}
    </>
  );
}
