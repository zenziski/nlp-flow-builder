import { memo, useCallback } from 'react';
import { BaseEdge, EdgeLabelRenderer, useReactFlow, type EdgeProps } from 'reactflow';
import { X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Pt = [number, number];

/**
 * segs: alternating [Y, X, Y, X, ...] — always odd length, starts/ends with Y.
 * Describes the orthogonal waypoints between source and target.
 *
 * Path structure for segs=[y0, bx, y1]:
 *   (sx,sy) → (sx,y0) → (bx,y0) → (bx,y1) → (tx,y1) → (tx,ty)
 */

type HandleInfo = {
  id: string;
  x: number;
  y: number;
  /** 'ns' = horizontal segment (drag up/down), 'ew' = vertical segment (drag left/right) */
  dir: 'ns' | 'ew';
  /** ≥ 0: index in segs to mutate. -1: extend source side. -2: extend target side. */
  action: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computePoints(sx: number, sy: number, tx: number, ty: number, segs: number[]): Pt[] {
  const pts: Pt[] = [[sx, sy]];
  let curX = sx;
  for (let i = 0; i < segs.length; i++) {
    if (i % 2 === 0) {                          // Y → end of vertical
      pts.push([curX, segs[i]]);
    } else {                                    // X → end of horizontal
      pts.push([segs[i], segs[i - 1]]);
      curX = segs[i];
    }
  }
  pts.push([tx, segs[segs.length - 1]]);        // final horizontal to tx
  pts.push([tx, ty]);                           // final vertical to target
  return pts;
}

function buildRoundedPath(pts: Pt[], r = 12): string {
  if (pts.length < 2) return '';
  const out: string[] = [`M ${pts[0][0]},${pts[0][1]}`];
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    const d1x = Math.sign(cx - px), d1y = Math.sign(cy - py);
    const d2x = Math.sign(nx - cx), d2y = Math.sign(ny - cy);
    const cr = Math.min(
      r,
      (Math.abs(cx - px) + Math.abs(cy - py)) * 0.45,
      (Math.abs(nx - cx) + Math.abs(ny - cy)) * 0.45,
    );
    if (cr < 0.5) {
      out.push(`L ${cx},${cy}`);
    } else {
      out.push(`L ${cx - d1x * cr},${cy - d1y * cr}`);
      out.push(`Q ${cx},${cy} ${cx + d2x * cr},${cy + d2y * cr}`);
    }
  }
  const [ex, ey] = pts[pts.length - 1];
  out.push(`L ${ex},${ey}`);
  return out.join(' ');
}

function computeHandles(sx: number, sy: number, tx: number, ty: number, segs: number[]): HandleInfo[] {
  const h: HandleInfo[] = [];
  let curX = sx;

  for (let i = 0; i < segs.length; i++) {
    if (i % 2 === 0) {
      // Horizontal segment handle (up/down)
      const rightX = i + 1 < segs.length ? segs[i + 1] : tx;
      h.push({ id: `h-${i}`, x: (curX + rightX) / 2, y: segs[i], dir: 'ns', action: i });
    } else {
      // Vertical bridge handle (left/right)
      h.push({ id: `vb-${i}`, x: segs[i], y: (segs[i - 1] + segs[i + 1]) / 2, dir: 'ew', action: i });
      curX = segs[i];
    }
  }

  return h;
}

// ─── Component ────────────────────────────────────────────────────────────────

function DeletableEdge({
  id,
  sourceX: sx, sourceY: sy,
  targetX: tx, targetY: ty,
  selected, markerEnd, style, data,
}: EdgeProps) {
  const { setEdges, getViewport } = useReactFlow();

  // Resolve segs — migrate legacy offsetX/offsetY to the new format
  const segs: number[] = (() => {
    if (Array.isArray(data?.segs)) return data.segs as number[];
    const midY = (sy + ty) / 2 + ((data?.offsetY as number) ?? 0);
    const ox = (data?.offsetX as number) ?? 0;
    return Math.abs(ox) >= 0.5 ? [midY, tx + ox, midY] : [midY];
  })();

  const pts = computePoints(sx, sy, tx, ty, segs);
  const edgePath = buildRoundedPath(pts);
  const handles = computeHandles(sx, sy, tx, ty, segs);
  const isMoved = segs.length > 1 || Math.abs(segs[0] - (sy + ty) / 2) > 2;
  const midHandle = handles[Math.floor(handles.length / 2)];

  const deleteEdge = useCallback(() => {
    setEdges((eds) => eds.filter((e) => e.id !== id));
  }, [id, setEdges]);

  const reset = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === id
          ? { ...edge, data: { ...edge.data, segs: [(sy + ty) / 2] } }
          : edge,
      ),
    );
  }, [id, sy, ty, setEdges]);

  const onHandleMouseDown = useCallback(
    (handle: HandleInfo, e: React.MouseEvent) => {
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const initSegs = [...segs]; // snapshot at drag start

      const onMove = (mv: MouseEvent) => {
        const { zoom } = getViewport();
        const dx = (mv.clientX - startX) / zoom;
        const dy = (mv.clientY - startY) / zoom;

        let newSegs: number[];

        newSegs = [...initSegs];
        newSegs[handle.action] = initSegs[handle.action] + (handle.dir === 'ns' ? dy : dx);

        setEdges((eds) =>
          eds.map((edge) =>
            edge.id === id ? { ...edge, data: { ...edge.data, segs: newSegs } } : edge,
          ),
        );
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [id, segs, getViewport, setEdges],
  );

  return (
    <>
      {/* Wide invisible stroke for easier clicking */}
      <path d={edgePath} fill="none" strokeWidth={14} stroke="transparent" className="react-flow__edge-interaction" />

      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#6366f1' : '#475569',
          strokeWidth: selected ? 2 : 1.5,
          transition: 'stroke 0.15s',
        }}
      />

      <EdgeLabelRenderer>
        {(selected || isMoved) &&
          handles.map((h) => (
            <div
              key={h.id}
              style={{
                position: 'absolute',
                transform: `translate(-50%,-50%) translate(${h.x}px,${h.y}px)`,
                pointerEvents: 'all',
              }}
              className="nodrag nopan"
            >
              {/* Delete button shown only on the middle handle */}
              {h.id === midHandle?.id && selected && (
                <button
                  style={{
                    position: 'absolute',
                    top: h.dir === 'ns' ? -20 : '50%',
                    left: h.dir === 'ns' ? '50%' : -20,
                    transform: h.dir === 'ns' ? 'translateX(-50%)' : 'translateY(-50%)',
                  }}
                  onClick={deleteEdge}
                  className="w-4 h-4 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center hover:bg-red-600 hover:border-red-500 transition-colors"
                  title="Remove connection"
                >
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              )}

              {/* Drag pill — horizontal for H segments, vertical for V segments */}
              <div
                onMouseDown={(e) => onHandleMouseDown(h, e)}
                onDoubleClick={reset}
                className={`flex items-center justify-center ${h.dir === 'ns' ? 'cursor-ns-resize' : 'cursor-ew-resize'}`}
                style={{ width: h.dir === 'ns' ? 36 : 14, height: h.dir === 'ns' ? 14 : 36 }}
                title="Drag to reroute · Double-click to reset all"
              >
                {h.dir === 'ns' ? (
                  <div className="w-7 h-1.5 rounded-full bg-indigo-500/70 border border-indigo-400/60 hover:bg-indigo-400 transition-colors" />
                ) : (
                  <div className="h-7 w-1.5 rounded-full bg-indigo-500/70 border border-indigo-400/60 hover:bg-indigo-400 transition-colors" />
                )}
              </div>
            </div>
          ))}
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(DeletableEdge);

