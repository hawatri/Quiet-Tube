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
import { getYoutubeVideoDetails } from "@/ai/flows/youtube";

interface AddSongDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function AddSongDialog({ isOpen, setIsOpen }: AddSongDialogProps) {
  const { activePlaylist, addSongToPlaylist } = usePlayer();
  const [url, setUrl] = useState("");
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const { toast } = useToast();

  const handleAddSong = async () => {
    if (!activePlaylist) {
        toast({ variant: "destructive", title: "No active playlist", description: "Please select a playlist first."});
        return;
    }
    if (url.trim()) {
      try {
        new URL(url); // Validate URL
        setIsFetchingTitle(true);
        const { title } = await getYoutubeVideoDetails(url);
        addSongToPlaylist(activePlaylist.id, { title, url });
        setUrl("");
        setIsOpen(false);
        toast({ title: "Song added!", description: `"${title}" was added to ${activePlaylist.name}.` });
      } catch (error) {
        toast({ variant: "destructive", title: "Invalid URL", description: "Please enter a valid YouTube URL." });
      } finally {
        setIsFetchingTitle(false);
      }
    } else {
        toast({ variant: "destructive", title: "Missing fields", description: "Please provide a URL." });
    }
  };
  
  const handleUrlChange = async (newUrl: string) => {
      setUrl(newUrl);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Song to "{activePlaylist?.name}"</DialogTitle>
          <DialogDescription>
            Enter the YouTube URL of the song you want to add. We'll fetch the title automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="col-span-3"
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={isFetchingTitle}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isFetchingTitle}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleAddSong} disabled={isFetchingTitle}>
            {isFetchingTitle ? "Adding..." : "Add Song"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
