"use client";

import { useRef, useState } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Download,
  FolderOpen,
  Music,
  Trash2,
  FileEdit,
  Play,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import EditPlaylistDialog from "./EditPlaylistDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from 'lucide-react';
import { ThemeToggle } from "./ThemeToggle";


export default function PlaylistSidebar() {
  const {
    playlists,
    activePlaylistId,
    selectPlaylist,
    createPlaylist,
    exportPlaylists,
    importPlaylists,
    deletePlaylist,
    playTrack,
  } = usePlayer();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [playlistToEdit, setPlaylistToEdit] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      setCreateDialogOpen(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDownloadAll = () => {
    exportPlaylists();
  }
  
  const handleDownloadSingle = (playlistId: string) => {
    exportPlaylists(playlistId);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      importPlaylists(Array.from(files));
    }
     // Reset file input to allow re-selection of the same file
    if(event.target) {
      event.target.value = "";
    }
  };

  const openEditDialog = (playlistId: string) => {
    setPlaylistToEdit(playlistId);
    setEditDialogOpen(true);
  };
  
  const handlePlayPlaylist = (playlistId: string, songs: any[]) => {
      if (songs.length > 0) {
          playTrack(playlistId, 0);
      }
  }

  return (
    <>
      <aside className="w-full flex flex-col bg-card/60 backdrop-blur-xl h-full md:border-r md:border-border">
        <div className="p-4 border-b border-border">
            <div className="flex justify-between items-center mb-4">
                 <h1 className="text-2xl font-bold text-primary-foreground font-headline">
                    QuietTube
                </h1>
                <div className="hidden md:block">
                  <ThemeToggle />
                </div>
            </div>
           
            <div className="flex flex-col space-y-2">
                 <Button
                    size="sm"
                    onClick={() => setCreateDialogOpen(true)}
                    className="w-full"
                >
                    <Plus className="mr-2 h-4 w-4" /> New Playlist
                </Button>
                <div className="flex space-x-2">
                     <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleDownloadAll}
                    >
                      <Download className="mr-2 h-4 w-4" /> All
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleImportClick}
                    >
                      <FolderOpen className="mr-2 h-4 w-4" /> Import
                    </Button>
                </div>
            </div>
             <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".music"
              onChange={handleFileChange}
              multiple
            />
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <h2 className="px-2 text-lg font-semibold tracking-tight">
              Playlists
            </h2>
            <div className="space-y-1 p-2">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="group relative rounded-md hover:bg-accent/80">
                  <Button
                    variant="ghost"
                    onClick={() => selectPlaylist(playlist.id)}
                    className={cn(
                      "w-full justify-start text-left",
                      activePlaylistId === playlist.id &&
                        "bg-accent text-accent-foreground"
                    )}
                  >
                    <Music className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate flex-grow">{playlist.name}</span>
                  </Button>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right">
                             <DropdownMenuItem onClick={() => handlePlayPlaylist(playlist.id, playlist.songs)} disabled={playlist.songs.length === 0}>
                                <Play className="mr-2 h-4 w-4" />
                                <span>Play</span>
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => openEditDialog(playlist.id)}>
                                <FileEdit className="mr-2 h-4 w-4" />
                                <span>Rename</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadSingle(playlist.id)}>
                                <Download className="mr-2 h-4 w-4" />
                                <span>Download</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                onClick={() => deletePlaylist(playlist.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </aside>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="name"
              placeholder="My Awesome Mix"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreatePlaylist}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {playlistToEdit && (
        <EditPlaylistDialog
            playlistId={playlistToEdit}
            isOpen={isEditDialogOpen}
            setIsOpen={setEditDialogOpen}
        />
      )}
    </>
  );
}
