"use client";

import { useState, useEffect } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditPlaylistDialogProps {
  playlistId: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function EditPlaylistDialog({ playlistId, isOpen, setIsOpen }: EditPlaylistDialogProps) {
  const { playlists, updatePlaylistName } = usePlayer();
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (isOpen) {
      const playlist = playlists.find(p => p.id === playlistId);
      if (playlist) {
        setNewName(playlist.name);
      }
    }
  }, [isOpen, playlistId, playlists]);

  const handleUpdate = () => {
    if (newName.trim()) {
      updatePlaylistName(playlistId, newName.trim());
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Playlist Name</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="playlist-name">Name</Label>
          <Input
            id="playlist-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={handleUpdate}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
