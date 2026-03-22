'use client';

import { ActivityEntry } from '@/lib/types';

interface Props {
  activity: ActivityEntry[];
  onClickAgent: (agentId: string) => void;
}

export default function ActivityFeed({ activity, onClickAgent }: Props) {
  return (
    <div className="h-full flex flex-col border-l border-[#2a2a2a] bg-[#111111]">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#2a2a2a]">
        <div className="text-[11px] text-[#555] uppercase tracking-[0.08em]">Activity</div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {activity.map((entry) => (
          <div
            key={entry.id}
            className="px-3 py-2 border-b border-[#1e1e1e] hover:bg-[#161616] cursor-pointer transition-colors"
            onClick={() => onClickAgent(entry.agentId)}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] text-[#666]">{entry.agentName}</span>
              <span className="text-[11px] text-[#444] tabular-nums">{entry.timestamp}</span>
            </div>
            <div className="text-[12px] text-[#888] leading-snug">{entry.action}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
