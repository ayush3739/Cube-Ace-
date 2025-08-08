'use client';

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Box, PanelLeft, Settings, Bot } from 'lucide-react';
import { CubeViewer } from '@/components/cube-viewer';
import { SidebarContent } from '@/components/sidebar-content';
import { useCubeStore } from '@/lib/store';
import { Separator } from '@/components/ui/separator';

function AppHeader() {
  const { isMobile } = useSidebar();
  const { status } = useCubeStore();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card/50 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10">
      {isMobile && <SidebarTrigger />}
      <div className="flex items-center gap-2 font-headline text-lg font-bold">
        <Box className="h-6 w-6 text-primary" />
        CubeAce
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {status === 'solving' || status === 'detecting' ? (
             <Bot className="h-4 w-4 animate-spin" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
         <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon">
        <SidebarContent />
      </Sidebar>
      <SidebarInset>
        <div className="flex h-screen flex-col">
          <AppHeader />
          <main className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
            <CubeViewer />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
