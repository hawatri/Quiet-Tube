"use client";

import { PlayerProvider } from "@/contexts/PlayerContext";
import PlaylistSidebar from "./PlaylistSidebar";
import TrackList from "./TrackList";
import PlayerControls from "./PlayerControls";
import dynamic from 'next/dynamic';
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";

const Player = dynamic(() => import('./Player'), { ssr: false });

export default function QuietTubeClient() {
  return (
    <PlayerProvider>
      <SidebarProvider>
        <div className="h-screen w-full flex flex-col bg-transparent font-body text-foreground">
          <div className="flex flex-1 overflow-hidden">
            <Sidebar>
                <PlaylistSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col">
                <main className="flex-1 flex flex-col overflow-hidden">
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
