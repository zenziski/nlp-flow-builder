import { useMemo, useRef } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PathNode {
  id: string;
  type: string;
  label: string;
  visitCount: number;
}

export interface PathEdge {
  from: string;
  to: string;
  count: number;
}

interface Props {
  nodes: PathNode[];
  edges: PathEdge[];
  totalSessions: number;
}

// ── Node type config ───────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  startNode:     { label: 'Start',     color: '#0d9488', dot: '#0d9488' },
  endNode:       { label: 'End',       color: '#475569', dot: '#475569' },
  messageNode:   { label: 'Message',   color: '#ef6c3e', dot: '#ef6c3e' },
  inputNode:     { label: 'Input',     color: '#3b82f6', dot: '#3b82f6' },
  intentNode:    { label: 'Intent',    color: '#8b5cf6', dot: '#8b5cf6' },
  conditionNode: { label: 'Condition', color: '#f59e0b', dot: '#f59e0b' },
  switchNode:    { label: 'Switch',    color: '#f97316', dot: '#f97316' },
  apiNode:       { label: 'API Call',  color: '#6366f1', dot: '#6366f1' },
  variableNode:  { label: 'Variable',  color: '#e11d48', dot: '#e11d48' },
  delayNode:     { label: 'Delay',     color: '#6b7280', dot: '#6b7280' },
  redirectNode:  { label: 'Redirect',  color: '#06b6d4', dot: '#06b6d4' },
  randomNode:    { label: 'Random',    color: '#ec4899', dot: '#ec4899' },
  subflowNode:   { label: 'Subflow',   color: '#16a34a', dot: '#16a34a' },
  unknown:       { label: 'Node',      color: '#9e7f6f', dot: '#9e7f6f' },
};

// ── Layout constants ───────────────────────────────────────────────────────────
const NODE_W = 172;
const NODE_H = 70;
const COL_GAP = 96;
const ROW_GAP = 18;
const PAD = 24;

// ── Layout algorithm (simplified Sugiyama) ─────────────────────────────────────
function computeLayout(nodes: PathNode[], edges: PathEdge[]) {
  // Build adjacency structures
  const inDegree = new Map<string, number>(nodes.map((n) => [n.id, 0]));
  const outEdges = new Map<string, string[]>();

  for (const e of edges) {
    if (!inDegree.has(e.from) || !inDegree.has(e.to)) continue; // skip stale refs
    inDegree.set(e.to, (inDegree.get(e.to) ?? 0) + 1);
    if (!outEdges.has(e.from)) outEdges.set(e.from, []);
    outEdges.get(e.from)!.push(e.to);
  }

  // BFS from roots to assign depth (column)
  const depth = new Map<string, number>();
  const queue: string[] = [];

  for (const n of nodes) {
    if ((inDegree.get(n.id) ?? 0) === 0) {
      depth.set(n.id, 0);
      queue.push(n.id);
    }
  }

  // If fully cyclic, seed from highest-visit node
  if (queue.length === 0 && nodes.length > 0) {
    const root = [...nodes].sort((a, b) => b.visitCount - a.visitCount)[0];
    depth.set(root.id, 0);
    queue.push(root.id);
  }

  let head = 0;
  while (head < queue.length) {
    const nid = queue[head++];
    const d = depth.get(nid)!;
    for (const neighbor of outEdges.get(nid) ?? []) {
      if (!depth.has(neighbor)) {
        depth.set(neighbor, d + 1);
        queue.push(neighbor);
      }
    }
  }

  // Assign disconnected nodes to the end
  let maxDepth = Math.max(...[...depth.values(), 0]);
  for (const n of nodes) {
    if (!depth.has(n.id)) depth.set(n.id, ++maxDepth);
  }

  // Group by column
  const columns = new Map<number, PathNode[]>();
  for (const n of nodes) {
    const d = depth.get(n.id)!;
    if (!columns.has(d)) columns.set(d, []);
    columns.get(d)!.push(n);
  }

  // Sort within each column by visitCount descending
  for (const col of columns.values()) {
    col.sort((a, b) => b.visitCount - a.visitCount);
  }

  // Compute max column height for vertical centering
  const maxColH = Math.max(
    ...[...columns.values()].map((col) => col.length * NODE_H + Math.max(0, col.length - 1) * ROW_GAP),
    NODE_H,
  );

  // Assign pixel positions
  const positions = new Map<string, { x: number; y: number }>();

  for (const [col, colNodes] of columns) {
    const colH = colNodes.length * NODE_H + Math.max(0, colNodes.length - 1) * ROW_GAP;
    const startY = PAD + (maxColH - colH) / 2;

    colNodes.forEach((n, row) => {
      positions.set(n.id, {
        x: PAD + col * (NODE_W + COL_GAP),
        y: startY + row * (NODE_H + ROW_GAP),
      });
    });
  }

  const allPositions = [...positions.values()];
  const svgWidth = allPositions.length
    ? Math.max(...allPositions.map((p) => p.x)) + NODE_W + PAD
    : NODE_W + PAD * 2;
  const svgHeight = allPositions.length
    ? Math.max(...allPositions.map((p) => p.y)) + NODE_H + PAD
    : NODE_H + PAD * 2;

  return { positions, svgWidth, svgHeight, maxDepth };
}

// ── SVG bezier edge ────────────────────────────────────────────────────────────
function EdgePath({
  from,
  to,
  count,
  maxCount,
  positions,
}: {
  from: string;
  to: string;
  count: number;
  maxCount: number;
  positions: Map<string, { x: number; y: number }>;
}) {
  const sp = positions.get(from);
  const tp = positions.get(to);
  if (!sp || !tp) return null;

  const sx = sp.x + NODE_W;
  const sy = sp.y + NODE_H / 2;
  const tx = tp.x;
  const ty = tp.y + NODE_H / 2;

  // Horizontal offset for control points — adds curvature
  const dx = Math.abs(tx - sx) * 0.5;
  const d = `M${sx},${sy} C${sx + dx},${sy} ${tx - dx},${ty} ${tx},${ty}`;

  const strokeWidth = Math.max(1.5, (count / maxCount) * 7);
  const opacity = 0.35 + (count / maxCount) * 0.45;

  return (
    <path
      d={d}
      stroke="var(--brand)"
      strokeWidth={strokeWidth}
      strokeOpacity={opacity}
      fill="none"
    />
  );
}

// ── Node box ───────────────────────────────────────────────────────────────────
function NodeBox({
  node,
  position,
  totalSessions,
}: {
  node: PathNode;
  position: { x: number; y: number };
  totalSessions: number;
}) {
  const cfg = TYPE_CONFIG[node.type] ?? TYPE_CONFIG.unknown;
  const pct = totalSessions > 0 ? Math.round((node.visitCount / totalSessions) * 100) : 0;

  return (
    <div
      className="absolute flex flex-col justify-center rounded-xl border bg-white px-3 py-2 shadow-sm transition-shadow hover:shadow-md"
      style={{
        left: position.x,
        top: position.y,
        width: NODE_W,
        height: NODE_H,
        borderColor: cfg.color + '55',
        boxShadow: `0 2px 12px -4px ${cfg.color}33`,
      }}
    >
      {/* Type badge */}
      <div className="mb-1 flex items-center gap-1.5">
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: cfg.color }}
        />
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
      </div>
      {/* Label */}
      <p className="truncate text-[12px] font-semibold text-slate-800 leading-tight" title={node.label}>
        {node.label}
      </p>
      {/* Visit count */}
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[10px] text-[#9e7f6f]">{node.visitCount.toLocaleString()} visits</span>
        <span
          className="rounded-full px-1.5 py-px text-[10px] font-bold"
          style={{ backgroundColor: cfg.color + '18', color: cfg.color }}
        >
          {pct}%
        </span>
      </div>
    </div>
  );
}

// ── Legend ─────────────────────────────────────────────────────────────────────
function Legend({ types }: { types: string[] }) {
  const unique = [...new Set(types)].slice(0, 10);
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {unique.map((t) => {
        const cfg = TYPE_CONFIG[t] ?? TYPE_CONFIG.unknown;
        return (
          <span
            key={t}
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
            style={{ borderColor: cfg.color + '55', color: cfg.color, backgroundColor: cfg.color + '10' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
            {cfg.label}
          </span>
        );
      })}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PathGraph({ nodes, edges, totalSessions }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { positions, svgWidth, svgHeight } = useMemo(
    () => computeLayout(nodes, edges),
    [nodes, edges],
  );

  const maxEdgeCount = useMemo(
    () => Math.max(...edges.map((e) => e.count), 1),
    [edges],
  );

  if (nodes.length === 0) {
    return (
      <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-[#e4cfc4] text-sm text-[#9e7f6f]">
        No path data yet — conversations are tracked as users interact with the bot
      </div>
    );
  }

  const nodeTypes = nodes.map((n) => n.type);

  return (
    <div>
      <Legend types={nodeTypes} />

      {/* Scrollable graph canvas */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-auto rounded-xl border border-[#e4cfc4] bg-[#fdfaf8]"
        style={{ maxHeight: '520px' }}
      >
        <div className="relative" style={{ width: svgWidth, height: svgHeight }}>
          {/* SVG layer for edges */}
          <svg
            className="pointer-events-none absolute inset-0"
            width={svgWidth}
            height={svgHeight}
            style={{ overflow: 'visible' }}
          >

            {edges.map((e) => (
              <EdgePath
                key={`${e.from}::${e.to}`}
                from={e.from}
                to={e.to}
                count={e.count}
                maxCount={maxEdgeCount}
                positions={positions}
              />
            ))}
          </svg>

          {/* Node boxes layer */}
          {nodes.map((node) => {
            const pos = positions.get(node.id);
            if (!pos) return null;
            return (
              <NodeBox
                key={node.id}
                node={node}
                position={pos}
                totalSessions={totalSessions}
              />
            );
          })}
        </div>
      </div>

      <p className="mt-2 text-right text-[11px] text-[#9e7f6f]">
        Edge thickness = transition frequency · Node % = share of sessions that reached this node
      </p>
    </div>
  );
}
