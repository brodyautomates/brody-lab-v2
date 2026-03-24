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

  const activeCount = agents.filter((a) => a.status === 'active').length;

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="shrink-0 px-5 py-4 flex items-center justify-between border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ff88] to-[#00cc6a] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="#0a0a0f" strokeWidth="1.5" fill="none" />
                <circle cx="8" cy="8" r="2" fill="#0a0a0f" />
              </svg>
            </div>
            <div>
              <h1 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">THE LAB</h1>
              <p className="text-[11px] text-[var(--text-muted)] -mt-0.5">Agent Workbench</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full bg-[var(--accent)]"
                style={{ animation: 'pulse-dot 2s infinite' }}
              />
              <span className="mono text-[11px]">{activeCount} active</span>
            </span>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="mono text-[11px]">{agents.length} total</span>
          </div>
          <div className="h-5 w-px bg-[var(--border)]" />
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span className="text-[11px] text-[var(--text-muted)]">System online</span>
          </div>
        </div>
      </header>

      {/* Connection Map */}
      <div className="h-[300px] shrink-0 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <ConnectionMap
          agents={agents}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Three columns — workbench */}
      <div className="flex-1 flex min-h-0">
        {/* Left — Agent Registry */}
        <div className="w-60 shrink-0">
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
        <div className="w-80 shrink-0">
          <ActivityFeed
            activity={activityFeed}
            onClickAgent={setSelectedId}
          />
        </div>
      </div>
    </div>
  );
}
