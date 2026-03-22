'use client';

import { useState } from 'react';
import AgentRegistry from '@/components/AgentRegistry';
import AgentWorkspace from '@/components/AgentWorkspace';
import ActivityFeed from '@/components/ActivityFeed';
import { agents, activityFeed } from '@/lib/data';

export default function Lab() {
  const [selectedId, setSelectedId] = useState<string | null>(agents[0]?.id ?? null);
  const selectedAgent = agents.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <div className="h-9 border-b border-[#2a2a2a] flex items-center justify-between px-4 shrink-0">
        <div className="text-[11px] text-[#555] uppercase tracking-[0.08em]">Brody Lab</div>
        <div className="flex items-center gap-3 text-[11px] text-[#555]">
          <span className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 bg-[#4ade80]"
              style={{ animation: 'pulse-dot 2s infinite' }}
            />
            {agents.filter((a) => a.status === 'active').length} active
          </span>
          <span>{agents.length} total</span>
        </div>
      </div>

      {/* Three columns */}
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
