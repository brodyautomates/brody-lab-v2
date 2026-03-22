'use client';

import { Agent } from '@/lib/types';

const statusColor: Record<string, string> = {
  active: '#4ade80',
  idle: '#555',
  error: '#ef4444',
};

interface Props {
  agents: Agent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function AgentRegistry({ agents, selectedId, onSelect }: Props) {
  return (
    <div className="h-full flex flex-col border-r border-[#2a2a2a] bg-[#111111]">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#2a2a2a]">
        <div className="text-[11px] text-[#555] uppercase tracking-[0.08em]">Agents</div>
        <div className="text-[12px] text-[#555] mt-0.5">{agents.length} registered</div>
      </div>

      {/* Agent list */}
      <div className="flex-1 overflow-y-auto">
        {agents.map((agent) => {
          const isSelected = selectedId === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => onSelect(agent.id)}
              className={`w-full text-left px-3 py-2 flex items-center gap-2.5 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-[#181818] border-l-2 border-l-[#4ade80]'
                  : 'border-l-2 border-l-transparent hover:bg-[#161616]'
              }`}
            >
              <span
                className="w-1.5 h-1.5 shrink-0"
                style={{
                  backgroundColor: statusColor[agent.status],
                  animation: agent.status === 'active' ? 'pulse-dot 2s infinite' : 'none',
                }}
              />
              <div className="min-w-0">
                <div className={`text-[13px] truncate ${isSelected ? 'text-[#c8c8c8]' : 'text-[#888]'}`}>
                  {agent.name}
                </div>
                {agent.brand && (
                  <div className="text-[11px] text-[#555] truncate">{agent.brand}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
