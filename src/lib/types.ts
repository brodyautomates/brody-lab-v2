export type AgentStatus = 'active' | 'idle' | 'error';

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  category: 'outreach' | 'content' | 'ads' | 'ops' | 'research' | 'custom';
  brand?: string;
  connectedTo: string[];
  config: {
    schedule?: string;
    api?: string;
    prompt?: string;
  };
  stats: {
    runs: number;
    lastRun: string;
    avgDuration: string;
  };
}

export interface ActivityEntry {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  timestamp: string;
}
