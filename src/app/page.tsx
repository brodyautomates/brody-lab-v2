'use client';

import { useState } from 'react';
import ConnectionMap from '@/components/ConnectionMap';
import AgentRegistry from '@/components/AgentRegistry';
import AgentWorkspace from '@/components/AgentWorkspace';
import ActivityFeed from '@/components/ActivityFeed';
import { agents, activityFeed } from '@/lib/data';

export default function Lab() {
  const [selectedId, setSelectedId] = useState<string | null>(agents[0]?.id ?? null);
  const selectedAgent = agents.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-[#2a2a2a] shrink-0">
        <div className="border border-[#2a2a2a] m-3 relative">
          {/* Top border label */}
          <div className="absolute -top-[9px] left-4 bg-[#111111] px-2 text-[10px] text-[#555] uppercase tracking-[0.1em]">
            System
          </div>
          {/* Bottom border stats */}
          <div className="absolute -bottom-[9px] right-4 bg-[#111111] px-2 flex items-center gap-3 text-[10px] text-[#555]">
            <span className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 bg-[#4ade80]"
                style={{ animation: 'pulse-dot 2s infinite' }}
              />
              {agents.filter((a) => a.status === 'active').length} active
            </span>
            <span className="text-[#333]">|</span>
            <span>{agents.length} registered</span>
          </div>
          <pre className="text-[#555] text-[10px] leading-[1.15] select-none text-center py-4 px-6">{`
 █████╗  ██████╗ ███████╗███╗   ██╗████████╗    ██╗      █████╗ ██████╗
██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝    ██║     ██╔══██╗██╔══██╗
███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║       ██║     ███████║██████╔╝
██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║       ██║     ██╔══██║██╔══██╗
██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║       ███████╗██║  ██║██████╔╝
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝       ╚══════╝╚═╝  ╚═╝╚═════╝`.trimStart()}</pre>
        </div>
      </div>

      {/* Connection Map */}
      <div className="h-[280px] shrink-0 border-b border-[#2a2a2a] bg-[#111111]">
        <ConnectionMap
          agents={agents}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Three columns — workbench */}
      <div className="flex-1 flex min-h-0">
        {/* Left — Agent Registry */}
        <div className="w-56 shrink-0">
          <AgentRegistry
            agents={agents}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Middle — Agent Workspace */}
        <div className="flex-1 min-w-0">
          <AgentWorkspace
            agent={selectedAgent}
            agents={agents}
            activity={activityFeed}
          />
        </div>

        {/* Right — Activity Feed */}
        <div className="w-72 shrink-0">
          <ActivityFeed
            activity={activityFeed}
            onClickAgent={setSelectedId}
          />
        </div>
      </div>
    </div>
  );
}
