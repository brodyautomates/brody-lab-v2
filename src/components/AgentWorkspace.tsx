'use client';

import { Agent, ActivityEntry } from '@/lib/types';

const statusColor: Record<string, string> = {
  active: '#4ade80',
  idle: '#555',
  error: '#ef4444',
};

const statusLabel: Record<string, string> = {
  active: 'ACTIVE',
  idle: 'IDLE',
  error: 'ERROR',
};

interface Props {
  agent: Agent | null;
  agents: Agent[];
  activity: ActivityEntry[];
}

export default function AgentWorkspace({ agent, agents, activity }: Props) {
  if (!agent) {
    return (
      <div className="h-full flex items-center justify-center bg-[#141414]">
        <div className="text-[#333] text-[13px]">Select an agent</div>
      </div>
    );
  }

  const agentActivity = activity.filter((a) => a.agentId === agent.id).slice(0, 10);
  const connectedAgents = agents.filter((a) => agent.connectedTo.includes(a.id));
  const feedsFrom = agents.filter((a) => a.connectedTo.includes(agent.id));

  return (
    <div className="h-full overflow-y-auto bg-[#141414]">
      {/* Agent header */}
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <span
            className="w-2 h-2 shrink-0"
            style={{
              backgroundColor: statusColor[agent.status],
              animation: agent.status === 'active' ? 'pulse-dot 2s infinite' : 'none',
            }}
          />
          <span className="text-[14px] font-semibold text-[#c8c8c8]">{agent.name}</span>
          <span className="text-[11px] uppercase tracking-[0.08em]" style={{ color: statusColor[agent.status] }}>
            {statusLabel[agent.status]}
          </span>
          {agent.brand && (
            <span className="text-[11px] text-[#555] ml-auto">Powered by {agent.brand}</span>
          )}
        </div>
        <div className="text-[12px] text-[#666] mt-1">{agent.description}</div>
      </div>

      {/* Stats strip */}
      <div className="px-4 py-2 border-b border-[#2a2a2a] flex gap-6 text-[12px]">
        <div>
          <span className="text-[#555]">Runs </span>
          <span className="text-[#c8c8c8]">{agent.stats.runs.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[#555]">Last run </span>
          <span className="text-[#c8c8c8]">{agent.stats.lastRun}</span>
        </div>
        <div>
          <span className="text-[#555]">Avg </span>
          <span className="text-[#c8c8c8]">{agent.stats.avgDuration}</span>
        </div>
      </div>

      {/* Activity log */}
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <div className="text-[11px] text-[#555] uppercase tracking-[0.08em] mb-2">Recent activity</div>
        {agentActivity.length === 0 ? (
          <div className="text-[12px] text-[#333]">No recent activity</div>
        ) : (
          <div className="space-y-0">
            {agentActivity.map((entry) => (
              <div key={entry.id} className="flex gap-3 py-[6px] border-b border-[#1e1e1e] last:border-0">
                <span className="text-[12px] text-[#444] shrink-0 tabular-nums">{entry.timestamp}</span>
                <span className="text-[12px] text-[#888]">{entry.action}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connections */}
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <div className="text-[11px] text-[#555] uppercase tracking-[0.08em] mb-2">Connections</div>
        <div className="space-y-1 text-[12px]">
          {feedsFrom.length > 0 && (
            <div>
              <span className="text-[#555]">Receives from </span>
              <span className="text-[#888]">{feedsFrom.map((a) => a.name).join(', ')}</span>
            </div>
          )}
          {connectedAgents.length > 0 && (
            <div>
              <span className="text-[#555]">Feeds into </span>
              <span className="text-[#888]">{connectedAgents.map((a) => a.name).join(', ')}</span>
            </div>
          )}
          {feedsFrom.length === 0 && connectedAgents.length === 0 && (
            <div className="text-[#333]">No connections</div>
          )}
        </div>
      </div>

      {/* Config */}
      <div className="px-4 py-3">
        <div className="text-[11px] text-[#555] uppercase tracking-[0.08em] mb-2">Config</div>
        <div className="space-y-1.5 text-[12px]">
          {agent.config.schedule && (
            <div>
              <span className="text-[#555]">Schedule </span>
              <span className="text-[#888]">{agent.config.schedule}</span>
            </div>
          )}
          {agent.config.api && (
            <div>
              <span className="text-[#555]">APIs </span>
              <span className="text-[#888]">{agent.config.api}</span>
            </div>
          )}
          {agent.config.prompt && (
            <div className="mt-2">
              <div className="text-[#555] mb-1">Prompt</div>
              <div className="text-[12px] text-[#666] bg-[#181818] border border-[#2a2a2a] px-3 py-2 leading-relaxed">
                {agent.config.prompt}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
