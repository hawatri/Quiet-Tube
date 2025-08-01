"use client";

import { PlayerProvider } from "@/contexts/PlayerContext";
import PlaylistSidebar from "./PlaylistSidebar";
import TrackList from "./TrackList";
import PlayerControls from "./PlayerControls";
import Player from "./Player";

export default function QuietTubeClient() {
  return (
    <PlayerProvider>
      <div className="h-screen w-full flex flex-col bg-background font-body text-foreground">
        <div className="flex flex-1 overflow-hidden">
          <PlaylistSidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <TrackList />
          </main>
        </div>
        <PlayerControls />
        <Player />
      </div>
    </PlayerProvider>
  );
}
