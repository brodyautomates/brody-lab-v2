'use client';

import { useEffect, useRef, useState } from 'react';
import { Agent } from '@/lib/types';

const statusColor: Record<string, string> = {
  active: '#00ff88',
  idle: '#4a4a5e',
  error: '#ff4466',
};

const statusGlow: Record<string, string> = {
  active: 'rgba(0, 255, 136, 0.4)',
  idle: 'rgba(74, 74, 94, 0.2)',
  error: 'rgba(255, 68, 102, 0.4)',
};

interface NodePosition {
  id: string;
  x: number;
  y: number;
}

interface Props {
  agents: Agent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ConnectionMap({ agents, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const { width, height } = dimensions;

  const getPositions = (): NodePosition[] => {
    if (width === 0) return [];

    const padX = 100;
    const padY = 50;
    const usableW = width - padX * 2;
    const usableH = height - padY * 2;

    const entryAgents = agents.filter(a =>
      ['lead-scraper', 'brand-scout', 'content-repurposer'].includes(a.id)
    );
    const midAgents = agents.filter(a =>
      ['cold-emailer', 'deal-pitcher', 'content-scheduler', 'ad-builder'].includes(a.id)
    );
    const endAgents = agents.filter(a =>
      ['lead-scorer', 'ad-auditor'].includes(a.id)
    );

    const columns = [entryAgents, midAgents, endAgents];
    const positions: NodePosition[] = [];

    columns.forEach((col, colIdx) => {
      const x = padX + (usableW / (columns.length - 1)) * colIdx;
      col.forEach((agent, rowIdx) => {
        const spacing = usableH / (col.length + 1);
        const y = padY + spacing * (rowIdx + 1);
        positions.push({ id: agent.id, x, y });
      });
    });

    return positions;
  };

  const positions = getPositions();

  const edges: { from: NodePosition; to: NodePosition; fromAgent: Agent }[] = [];
  agents.forEach((agent) => {
    const fromPos = positions.find((p) => p.id === agent.id);
    if (!fromPos) return;
    agent.connectedTo.forEach((targetId) => {
      const toPos = positions.find((p) => p.id === targetId);
      if (toPos) {
        edges.push({ from: fromPos, to: toPos, fromAgent: agent });
      }
    });
  });

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {width > 0 && (
        <svg width={width} height={height} className="absolute inset-0">
          <defs>
            {/* Subtle grid pattern */}
            <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="0.6" fill="rgba(255,255,255,0.03)" />
            </pattern>

            {/* Gradient for active connections */}
            <linearGradient id="edge-active" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id="edge-idle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4a4a5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4a4a5e" stopOpacity="0.08" />
            </linearGradient>

            {/* Glow filter */}
            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width={width} height={height} fill="url(#map-grid)" />

          {/* Column labels */}
          <text x={100} y={28} fill="rgba(255,255,255,0.12)" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500" letterSpacing="0.08em">
            SOURCES
          </text>
          <text x={width / 2} y={28} textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500" letterSpacing="0.08em">
            PROCESSORS
          </text>
          <text x={width - 100} y={28} textAnchor="end" fill="rgba(255,255,255,0.12)" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500" letterSpacing="0.08em">
            OUTPUTS
          </text>

          {/* Edges */}
          {edges.map((edge, i) => {
            const midX = (edge.from.x + edge.to.x) / 2;
            const isActive = edge.fromAgent.status === 'active';
            const isHighlighted = selectedId === edge.from.id || selectedId === edge.to.id;

            return (
              <g key={i}>
                {/* Glow layer for highlighted edges */}
                {isHighlighted && (
                  <path
                    d={`M ${edge.from.x} ${edge.from.y} C ${midX} ${edge.from.y}, ${midX} ${edge.to.y}, ${edge.to.x} ${edge.to.y}`}
                    stroke={isActive ? '#00ff88' : '#4a4a5e'}
                    strokeWidth="4"
                    fill="none"
                    opacity="0.15"
                  />
                )}
                <path
                  d={`M ${edge.from.x} ${edge.from.y} C ${midX} ${edge.from.y}, ${midX} ${edge.to.y}, ${edge.to.x} ${edge.to.y}`}
                  stroke={isHighlighted ? (isActive ? '#00ff88' : '#6a6a7e') : 'url(#edge-idle)'}
                  strokeWidth={isHighlighted ? 1.5 : 1}
                  fill="none"
                  opacity={isHighlighted ? 0.6 : 1}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {positions.map((pos) => {
            const agent = agents.find((a) => a.id === pos.id);
            if (!agent) return null;
            const isSelected = selectedId === pos.id;
            const isActive = agent.status === 'active';
            const color = statusColor[agent.status];

            const nodeW = 120;
            const nodeH = 36;

            return (
              <g
                key={pos.id}
                onClick={() => onSelect(pos.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Selection glow */}
                {isSelected && (
                  <rect
                    x={pos.x - nodeW / 2 - 2}
                    y={pos.y - nodeH / 2 - 2}
                    width={nodeW + 4}
                    height={nodeH + 4}
                    rx="10"
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    opacity="0.3"
                  />
                )}

                {/* Node background */}
                <rect
                  x={pos.x - nodeW / 2}
                  y={pos.y - nodeH / 2}
                  width={nodeW}
                  height={nodeH}
                  rx="8"
                  fill={isSelected ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)'}
                  stroke={isSelected ? color : 'rgba(255,255,255,0.06)'}
                  strokeWidth="1"
                />

                {/* Status indicator */}
                <circle
                  cx={pos.x - nodeW / 2 + 16}
                  cy={pos.y}
                  r="3"
                  fill={color}
                  filter={isActive ? 'url(#glow-green)' : undefined}
                >
                  {isActive && (
                    <animate
                      attributeName="opacity"
                      values="1;0.4;1"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>

                {/* Label */}
                <text
                  x={pos.x + 6}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isSelected ? '#e8e8ed' : '#8b8b9e'}
                  fontSize="9.5"
                  fontFamily="'Inter', sans-serif"
                  fontWeight="500"
                  letterSpacing="0.02em"
                >
                  {agent.name.length > 14 ? agent.name.slice(0, 13) + '..' : agent.name}
                </text>

                {/* Brand tag */}
                {agent.brand && (
                  <text
                    x={pos.x + 6}
                    y={pos.y + nodeH / 2 + 14}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="rgba(255,255,255,0.2)"
                    fontSize="8"
                    fontFamily="'Inter', sans-serif"
                  >
                    {agent.brand}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
