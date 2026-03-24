'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Agent } from '@/lib/types';

const statusColor: Record<string, string> = {
  active: '#00ff88',
  idle: '#3a3a4e',
  error: '#ff4466',
};

interface Props {
  agents: Agent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface NodeState {
  id: string;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  phase: number;
  driftSpeed: number;
  driftRadius: number;
}

export default function ConnectionMap({ agents, selectedId, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<NodeState[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Stable refs for animation callback
  const selectedIdRef = useRef(selectedId);
  const hoveredIdRef = useRef(hoveredId);
  selectedIdRef.current = selectedId;
  hoveredIdRef.current = hoveredId;

  // Initialize node positions with force-directed seed
  const initNodes = useCallback((w: number, h: number) => {
    if (agents.length === 0 || w === 0) return;

    const cx = w / 2;
    const cy = h / 2;
    const spread = Math.min(w, h) * 0.3;

    // Seed positions
    const nodes: NodeState[] = agents.map((a, i) => {
      const angle = (i / agents.length) * Math.PI * 2 + Math.PI * 0.3;
      const r = spread * (0.6 + ((i * 7 + 3) % 10) / 15);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      return {
        id: a.id,
        x, y,
        baseX: x,
        baseY: y,
        phase: Math.random() * Math.PI * 2,
        driftSpeed: 0.3 + Math.random() * 0.4,
        driftRadius: 3 + Math.random() * 6,
      };
    });

    // Simple force sim to spread them out
    const edgeSet = new Set<string>();
    agents.forEach(a => a.connectedTo.forEach(t => {
      edgeSet.add(`${a.id}:${t}`);
    }));

    for (let iter = 0; iter < 100; iter++) {
      const temp = 1 - iter / 100;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (5000 * temp) / (dist * dist);
          nodes[i].x += (dx / dist) * force;
          nodes[i].y += (dy / dist) * force;
          nodes[j].x -= (dx / dist) * force;
          nodes[j].y -= (dy / dist) * force;
        }
      }
      agents.forEach(agent => {
        const n1 = nodes.find(n => n.id === agent.id)!;
        agent.connectedTo.forEach(tid => {
          const n2 = nodes.find(n => n.id === tid);
          if (!n2) return;
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 130) * 0.006 * temp;
          n1.x += (dx / dist) * force;
          n1.y += (dy / dist) * force;
          n2.x -= (dx / dist) * force;
          n2.y -= (dy / dist) * force;
        });
      });
      nodes.forEach(n => {
        n.x += (cx - n.x) * 0.003;
        n.y += (cy - n.y) * 0.003;
        n.x = Math.max(90, Math.min(w - 90, n.x));
        n.y = Math.max(50, Math.min(h - 50, n.y));
      });
    }

    nodes.forEach(n => { n.baseX = n.x; n.baseY = n.y; });
    nodesRef.current = nodes;

    // Seed ambient particles
    const particles: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        life: Math.random() * 200,
        maxLife: 150 + Math.random() * 200,
        size: 0.5 + Math.random() * 1.2,
      });
    }
    particlesRef.current = particles;
  }, [agents]);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        const h = containerRef.current.offsetHeight;
        setDimensions({ width: w, height: h });
        initNodes(w, h);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [initNodes]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const draw = () => {
      if (!running) return;
      const { width: w, height: h } = canvas;
      const t = timeRef.current;
      timeRef.current += 0.016;

      ctx.clearRect(0, 0, w, h);

      const dpr = window.devicePixelRatio || 1;
      const nodes = nodesRef.current;
      const particles = particlesRef.current;
      const selId = selectedIdRef.current;
      const hovId = hoveredIdRef.current;

      // Update node drift
      nodes.forEach(n => {
        n.x = n.baseX + Math.sin(t * n.driftSpeed + n.phase) * n.driftRadius;
        n.y = n.baseY + Math.cos(t * n.driftSpeed * 0.7 + n.phase + 1) * n.driftRadius * 0.8;
      });

      // Connected set
      const connSet = new Set<string>();
      if (selId) {
        connSet.add(selId);
        const selAgent = agents.find(a => a.id === selId);
        if (selAgent) selAgent.connectedTo.forEach(id => connSet.add(id));
        agents.forEach(a => { if (a.connectedTo.includes(selId)) connSet.add(a.id); });
      }

      // Draw ambient particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        if (p.life > p.maxLife) {
          p.x = Math.random() * w / dpr;
          p.y = Math.random() * h / dpr;
          p.life = 0;
          p.maxLife = 150 + Math.random() * 200;
        }
        const lifeRatio = p.life / p.maxLife;
        const alpha = lifeRatio < 0.2 ? lifeRatio / 0.2 : lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1;
        ctx.beginPath();
        ctx.arc(p.x * dpr, p.y * dpr, p.size * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.06})`;
        ctx.fill();
      });

      // Draw edges
      agents.forEach(agent => {
        const n1 = nodes.find(n => n.id === agent.id);
        if (!n1) return;
        agent.connectedTo.forEach(tid => {
          const n2 = nodes.find(n => n.id === tid);
          if (!n2) return;

          const isHighlighted = selId && (selId === n1.id || selId === n2.id);
          const isActive = agent.status === 'active';
          const dimmed = selId && !isHighlighted;

          // Organic curve — slight wobble
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const nx = -dy / (dist || 1);
          const ny = dx / (dist || 1);
          const wobble = Math.sin(t * 0.5 + n1.phase + n2.phase) * 8;
          const cpx = (n1.x + n2.x) / 2 + nx * wobble;
          const cpy = (n1.y + n2.y) / 2 + ny * wobble;

          // Glow layer
          if (isHighlighted) {
            ctx.beginPath();
            ctx.moveTo(n1.x * dpr, n1.y * dpr);
            ctx.quadraticCurveTo(cpx * dpr, cpy * dpr, n2.x * dpr, n2.y * dpr);
            ctx.strokeStyle = isActive ? 'rgba(0, 255, 136, 0.06)' : 'rgba(140, 140, 170, 0.04)';
            ctx.lineWidth = 6 * dpr;
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.moveTo(n1.x * dpr, n1.y * dpr);
          ctx.quadraticCurveTo(cpx * dpr, cpy * dpr, n2.x * dpr, n2.y * dpr);

          if (isHighlighted) {
            ctx.strokeStyle = isActive ? 'rgba(0, 255, 136, 0.35)' : 'rgba(140, 140, 170, 0.2)';
            ctx.lineWidth = 1.2 * dpr;
          } else {
            ctx.strokeStyle = dimmed ? 'rgba(255, 255, 255, 0.015)' : 'rgba(255, 255, 255, 0.04)';
            ctx.lineWidth = 0.6 * dpr;
          }
          ctx.stroke();

          // Traveling particle on highlighted active edges
          if (isHighlighted && isActive) {
            const progress = (t * 0.3 + n1.phase) % 1;
            const tp = progress;
            const invT = 1 - tp;
            const px = invT * invT * n1.x + 2 * invT * tp * cpx + tp * tp * n2.x;
            const py = invT * invT * n1.y + 2 * invT * tp * cpy + tp * tp * n2.y;

            ctx.beginPath();
            ctx.arc(px * dpr, py * dpr, 1.5 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
            ctx.fill();

            // Trail
            for (let tr = 1; tr <= 3; tr++) {
              const tpT = ((t * 0.3 + n1.phase) - tr * 0.03) % 1;
              const tpTc = tpT < 0 ? tpT + 1 : tpT;
              const invTT = 1 - tpTc;
              const trx = invTT * invTT * n1.x + 2 * invTT * tpTc * cpx + tpTc * tpTc * n2.x;
              const trY = invTT * invTT * n1.y + 2 * invTT * tpTc * cpy + tpTc * tpTc * n2.y;
              ctx.beginPath();
              ctx.arc(trx * dpr, trY * dpr, (1.2 - tr * 0.3) * dpr, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(0, 255, 136, ${0.3 - tr * 0.08})`;
              ctx.fill();
            }
          }
        });
      });

      // Draw nodes
      nodes.forEach(node => {
        const agent = agents.find(a => a.id === node.id);
        if (!agent) return;

        const isSelected = selId === node.id;
        const isConn = connSet.has(node.id);
        const isHovered = hovId === node.id;
        const dimmed = selId !== null && !isSelected && !isConn;
        const isActive = agent.status === 'active';
        const color = statusColor[agent.status];

        const x = node.x * dpr;
        const y = node.y * dpr;

        // Parse color for rgba
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        // Outer haze
        if (!dimmed) {
          const hazeR = (isSelected ? 50 : isActive ? 35 : 20) * dpr;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, hazeR);
          const baseAlpha = isSelected ? 0.15 : isActive ? 0.08 : 0.03;
          grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${baseAlpha})`);
          grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          ctx.beginPath();
          ctx.arc(x, y, hazeR, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Breathing ring for selected
        if (isSelected) {
          const ringR = (22 + Math.sin(t * 1.5) * 3) * dpr;
          ctx.beginPath();
          ctx.arc(x, y, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.12 + Math.sin(t * 1.5) * 0.05})`;
          ctx.lineWidth = 0.8 * dpr;
          ctx.stroke();
        }

        // Core dot
        const coreR = (isSelected ? 5 : isHovered ? 4.5 : 3.5) * dpr;
        const coreAlpha = dimmed ? 0.15 : isSelected ? 1 : isActive ? 0.8 : 0.35;

        ctx.beginPath();
        ctx.arc(x, y, coreR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${coreAlpha})`;
        ctx.fill();

        // Inner bright point
        if (!dimmed) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${isSelected ? 0.7 : isActive ? 0.4 : 0.15})`;
          ctx.fill();
        }

        // Label
        const labelAlpha = dimmed ? 0.08 : isSelected ? 0.85 : isHovered ? 0.7 : isConn ? 0.45 : 0.2;
        ctx.font = `${isSelected ? 500 : 400} ${(isSelected ? 10.5 : 9.5) * dpr}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(232, 232, 237, ${labelAlpha})`;
        ctx.fillText(
          agent.name.length > 14 ? agent.name.slice(0, 13) + '..' : agent.name,
          x,
          y + (isSelected ? 18 : 16) * dpr,
        );

        // Brand sublabel
        if (agent.brand && !dimmed) {
          ctx.font = `400 ${7.5 * dpr}px Inter, sans-serif`;
          ctx.fillStyle = `rgba(232, 232, 237, ${labelAlpha * 0.5})`;
          ctx.fillText(agent.brand, x, y + (isSelected ? 28 : 26) * dpr);
        }
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [agents, dimensions]);

  // Hit detection for clicks and hovers
  const getNodeAt = useCallback((clientX: number, clientY: number): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    for (const node of nodesRef.current) {
      const dx = node.x - x;
      const dy = node.y - y;
      if (dx * dx + dy * dy < 25 * 25) return node.id;
    }
    return null;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const id = getNodeAt(e.clientX, e.clientY);
    if (id) onSelect(id);
  }, [getNodeAt, onSelect]);

  const handleMove = useCallback((e: React.MouseEvent) => {
    const id = getNodeAt(e.clientX, e.clientY);
    setHoveredId(id);
    if (containerRef.current) {
      containerRef.current.style.cursor = id ? 'pointer' : 'default';
    }
  }, [getNodeAt]);

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        width={dimensions.width * dpr}
        height={dimensions.height * dpr}
        style={{ width: dimensions.width, height: dimensions.height }}
        className="absolute inset-0"
        onClick={handleClick}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoveredId(null)}
      />
    </div>
  );
}
