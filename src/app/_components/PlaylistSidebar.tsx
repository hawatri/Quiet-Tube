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

export default function PlaylistSidebar() {
  const {
    playlists,
    activePlaylistId,
    selectPlaylist,
    createPlaylist,
    exportPlaylists,
    importPlaylists,
    deletePlaylist,
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

  return (
    <>
      <aside className="w-64 flex flex-col bg-card border-r border-border h-full">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-foreground font-headline">
            QuietTube
          </h1>
           <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> New
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <h2 className="px-2 text-lg font-semibold tracking-tight">
              Playlists
            </h2>
            <div className="space-y-1 p-2">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="group relative">
                  <Button
                    variant="ghost"
                    onClick={() => selectPlaylist(playlist.id)}
                    className={cn(
                      "w-full justify-start",
                      activePlaylistId === playlist.id &&
                        "bg-accent text-accent-foreground"
                    )}
                  >
                    <Music className="mr-2 h-4 w-4" />
                    <span className="truncate">{playlist.name}</span>
                  </Button>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEditDialog(playlist.id)}
                    >
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => deletePlaylist(playlist.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="p-2 border-t border-border">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={exportPlaylists}
            >
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleImportClick}
            >
              <FolderOpen className="mr-2 h-4 w-4" /> Import
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".music"
              onChange={handleFileChange}
              multiple
            />
          </div>
        </div>
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
