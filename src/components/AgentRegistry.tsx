'use client';

import { Agent } from '@/lib/types';

const statusColor: Record<string, string> = {
  active: '#00ff88',
  idle: '#4a4a5e',
  error: '#ff4466',
};

const categoryIcon: Record<string, string> = {
  outreach: 'O',
  content: 'C',
  ads: 'A',
  ops: 'S',
  research: 'R',
  custom: 'X',
};

interface Props {
  agents: Agent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function AgentRegistry({ agents, selectedId, onSelect }: Props) {
  const categories = [...new Set(agents.map((a) => a.category))];

  return (
    <div className="h-full flex flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <div className="text-[12px] font-semibold text-[var(--text-primary)]">Agents</div>
        <div className="text-[11px] text-[var(--text-muted)] mt-0.5 mono">
          {agents.filter(a => a.status === 'active').length} active / {agents.length} total
        </div>
      </div>

      {/* Agent list grouped by category */}
      <div className="flex-1 overflow-y-auto py-1">
        {categories.map((cat) => (
          <div key={cat}>
            <div className="px-4 pt-3 pb-1.5">
              <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.1em]">
                {cat}
              </span>
            </div>
            {agents
              .filter((a) => a.category === cat)
              .map((agent) => {
                const isSelected = selectedId === agent.id;
                return (
                  <button
                    key={agent.id}
                    onClick={() => onSelect(agent.id)}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-[var(--accent-glow)]'
                        : 'hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    {/* Category badge */}
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-[10px] font-semibold mono"
                      style={{
                        background: isSelected ? 'var(--accent-dim)' : 'var(--bg-card)',
                        color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                        border: `1px solid ${isSelected ? 'var(--border-active)' : 'var(--border)'}`,
                      }}
                    >
                      {categoryIcon[agent.category]}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[12px] font-medium truncate ${
                            isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                          }`}
                        >
                          {agent.name}
                        </span>
                      </div>
                      {agent.brand && (
                        <div className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{agent.brand}</div>
                      )}
                    </div>

                    {/* Status dot */}
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: statusColor[agent.status],
                        animation: agent.status === 'active' ? 'pulse-dot 2s infinite' : 'none',
                        boxShadow: agent.status === 'active' ? '0 0 6px rgba(0, 255, 136, 0.4)' : 'none',
                      }}
                    />
                  </button>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
