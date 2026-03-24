'use client';

import { Agent, ActivityEntry } from '@/lib/types';

const statusColor: Record<string, string> = {
  active: '#00ff88',
  idle: '#4a4a5e',
  error: '#ff4466',
};

const statusLabel: Record<string, string> = {
  active: 'Active',
  idle: 'Idle',
  error: 'Error',
};

interface Props {
  agent: Agent | null;
  agents: Agent[];
  activity: ActivityEntry[];
}

export default function AgentWorkspace({ agent, agents, activity }: Props) {
  if (!agent) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L17 6V14L10 18L3 14V6L10 2Z" stroke="var(--text-muted)" strokeWidth="1.2" fill="none" />
            </svg>
          </div>
          <p className="text-[13px] text-[var(--text-muted)]">Select an agent to inspect</p>
        </div>
      </div>
    );
  }

  const agentActivity = activity.filter((a) => a.agentId === agent.id).slice(0, 10);
  const connectedAgents = agents.filter((a) => agent.connectedTo.includes(a.id));
  const feedsFrom = agents.filter((a) => a.connectedTo.includes(agent.id));
  const isActive = agent.status === 'active';

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-primary)] border-x border-[var(--border)]">
      {/* Agent header */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: isActive ? 'var(--accent-dim)' : agent.status === 'error' ? 'var(--error-dim)' : 'var(--bg-card)',
              border: `1px solid ${isActive ? 'var(--border-active)' : 'var(--border)'}`,
              animation: isActive ? 'glow-pulse 3s infinite' : 'none',
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: statusColor[agent.status] }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)] truncate">{agent.name}</h2>
              <span
                className="text-[10px] font-medium uppercase tracking-[0.06em] px-2 py-0.5 rounded-full"
                style={{
                  color: statusColor[agent.status],
                  background: isActive ? 'var(--accent-dim)' : agent.status === 'error' ? 'var(--error-dim)' : 'var(--bg-card)',
                }}
              >
                {statusLabel[agent.status]}
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 truncate">{agent.description}</p>
          </div>
          {agent.brand && (
            <span className="text-[11px] text-[var(--text-muted)] shrink-0 mono">{agent.brand}</span>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="px-5 py-3 border-b border-[var(--border)] flex gap-1">
        {[
          { label: 'Total runs', value: agent.stats.runs.toLocaleString() },
          { label: 'Last run', value: agent.stats.lastRun },
          { label: 'Avg duration', value: agent.stats.avgDuration },
        ].map((stat) => (
          <div key={stat.label} className="flex-1 py-2 px-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.06em] mb-0.5">{stat.label}</div>
            <div className="text-[14px] font-semibold text-[var(--text-primary)] mono">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Activity log */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h3 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Recent Activity</h3>
        {agentActivity.length === 0 ? (
          <div className="text-[12px] text-[var(--text-muted)] py-3 text-center">No recent activity</div>
        ) : (
          <div className="space-y-0">
            {agentActivity.map((entry, i) => (
              <div
                key={entry.id}
                className="flex gap-3 py-2 border-b border-[var(--border)] last:border-0"
                style={{ animation: `slide-in 0.3s ease ${i * 0.05}s both` }}
              >
                <span className="text-[11px] text-[var(--text-muted)] shrink-0 tabular-nums mono pt-px">{entry.timestamp}</span>
                <span className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{entry.action}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connections */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h3 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Connections</h3>
        <div className="space-y-2">
          {feedsFrom.length > 0 && (
            <div className="flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0">
                <path d="M7 11L7 3M7 3L4 6M7 3L10 6" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <span className="text-[11px] text-[var(--text-muted)]">Receives from</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {feedsFrom.map((a) => (
                    <span key={a.id} className="text-[11px] text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border)] px-2 py-0.5 rounded-md mono">
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          {connectedAgents.length > 0 && (
            <div className="flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0">
                <path d="M7 3L7 11M7 11L4 8M7 11L10 8" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <span className="text-[11px] text-[var(--text-muted)]">Feeds into</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {connectedAgents.map((a) => (
                    <span key={a.id} className="text-[11px] text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border)] px-2 py-0.5 rounded-md mono">
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          {feedsFrom.length === 0 && connectedAgents.length === 0 && (
            <div className="text-[12px] text-[var(--text-muted)]">No connections</div>
          )}
        </div>
      </div>

      {/* Config */}
      <div className="px-5 py-4">
        <h3 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Configuration</h3>
        <div className="space-y-2.5">
          {agent.config.schedule && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[var(--text-muted)] w-16 shrink-0">Schedule</span>
              <span className="text-[12px] text-[var(--text-secondary)] mono">{agent.config.schedule}</span>
            </div>
          )}
          {agent.config.api && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[var(--text-muted)] w-16 shrink-0">APIs</span>
              <span className="text-[12px] text-[var(--text-secondary)] mono">{agent.config.api}</span>
            </div>
          )}
          {agent.config.prompt && (
            <div className="mt-3">
              <div className="text-[11px] text-[var(--text-muted)] mb-2">System Prompt</div>
              <div className="text-[12px] text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border)] px-4 py-3 rounded-lg leading-relaxed mono">
                {agent.config.prompt}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
