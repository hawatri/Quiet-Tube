"use client";

import { useState } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AddSongDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function AddSongDialog({ isOpen, setIsOpen }: AddSongDialogProps) {
  const { activePlaylist, addSongToPlaylist } = usePlayer();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const handleAddSong = () => {
    if (!activePlaylist) {
        toast({ variant: "destructive", title: "No active playlist", description: "Please select a playlist first."});
        return;
    }
    if (title.trim() && url.trim()) {
      try {
        new URL(url); // Validate URL
        addSongToPlaylist(activePlaylist.id, { title, url });
        setTitle("");
        setUrl("");
        setIsOpen(false);
        toast({ title: "Song added!", description: `"${title}" was added to ${activePlaylist.name}.` });
      } catch (error) {
        toast({ variant: "destructive", title: "Invalid URL", description: "Please enter a valid YouTube URL." });
      }
    } else {
        toast({ variant: "destructive", title: "Missing fields", description: "Please provide both a title and a URL." });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Song to &quot;{activePlaylist?.name}&quot;</DialogTitle>
          <DialogDescription>
            Enter the title and YouTube URL of the song you want to add.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Lo-fi Hip Hop Radio"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="col-span-3"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAddSong}>Add Song</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
