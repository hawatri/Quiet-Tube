
"use client";

import { useState, useEffect } from "react";
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
  const [title, setTitle] = useState("");
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isOpen) {
        // Reset state when dialog closes
        setUrl("");
        setTitle("");
        setIsFetchingTitle(false);
    }
  }, [isOpen])

  const handleAddSong = async () => {
    if (!activePlaylist) {
        toast({ variant: "destructive", title: "No active playlist", description: "Please select a playlist first."});
        return;
    }
    if (url.trim() && title.trim()) {
      try {
        new URL(url); // Validate URL
        addSongToPlaylist(activePlaylist.id, { title, url });
        setIsOpen(false);
        toast({ title: "Song added!", description: `"${title}" was added to ${activePlaylist.name}.` });
      } catch (error) {
        toast({ variant: "destructive", title: "Invalid URL", description: "Please enter a valid YouTube URL." });
      }
    } else {
        toast({ variant: "destructive", title: "Missing fields", description: "Please provide a title and a URL." });
    }
  };
  
  const handleUrlChange = async (newUrl: string) => {
      setUrl(newUrl);
      if (newUrl.trim() === "") {
          setTitle("");
          return;
      }
      
      try {
        new URL(newUrl); // Validate before fetching
        setIsFetchingTitle(true);
        const { title: fetchedTitle } = await getYoutubeVideoDetails(newUrl);
        setTitle(fetchedTitle);
      } catch (error) {
        // Silently fail, user can enter title manually
        setTitle("");
      } finally {
        setIsFetchingTitle(false);
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Add Song to "{activePlaylist?.name}"</DialogTitle>
          <DialogDescription>
            Enter the YouTube URL. We'll try to fetch the title, but you can edit it.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 md:py-4">
           <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
            <Label htmlFor="url" className="md:text-right font-medium">
              URL
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="md:col-span-3"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
            <Label htmlFor="title" className="md:text-right font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="md:col-span-3"
              placeholder={isFetchingTitle ? "Fetching title..." : "Song Title"}
              disabled={isFetchingTitle}
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="w-full sm:w-auto">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAddSong} disabled={isFetchingTitle} className="w-full sm:w-auto">
            {isFetchingTitle ? "Loading..." : "Add Song"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
