"use client";

import { PlayerProvider } from "@/contexts/PlayerContext";
import PlaylistSidebar from "./PlaylistSidebar";
import TrackList from "./TrackList";
import PlayerControls from "./PlayerControls";
import dynamic from 'next/dynamic';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
                 <header className="p-4 border-b border-border flex items-center justify-between md:hidden sticky top-0 bg-card/80 backdrop-blur-sm z-10">
                    <h1 className="text-2xl font-bold text-primary-foreground font-headline">
                        QuietTube
                    </h1>
                    <SidebarTrigger />
                </header>
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
