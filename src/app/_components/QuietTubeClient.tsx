"use client";

import { PlayerProvider } from "@/contexts/PlayerContext";
import PlaylistSidebar from "./PlaylistSidebar";
import TrackList from "./TrackList";
import PlayerControls from "./PlayerControls";
import dynamic from 'next/dynamic';
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import PlayerBackground from "./PlayerBackground";

const Player = dynamic(() => import('./Player'), { ssr: false });

export default function QuietTubeClient() {
  return (
    <PlayerProvider>
      <PlayerBackground />
      <SidebarProvider>
        <div className="h-screen w-full flex flex-col bg-transparent font-body text-foreground relative z-10">
          <div className="flex flex-1 overflow-hidden">
            <Sidebar>
                <PlaylistSidebar />
            </Sidebar>
            <SidebarInset>
                <main className="flex-1 flex flex-col overflow-hidden bg-card/60 backdrop-blur-xl md:m-2 md:rounded-xl">
                    <TrackList />
                </main>
            </SidebarInset>
          </div>
          <PlayerControls />
          <Player />
        </div>
      </SidebarProvider>
    </PlayerProvider>
  );
}
