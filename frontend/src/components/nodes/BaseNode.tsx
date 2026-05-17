import { memo, ReactNode } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Trash2 } from 'lucide-react';
import { useNodesStore } from '../../stores/useNodesStore';

interface BaseNodeProps extends NodeProps {
  icon: ReactNode;
  title: string;
  color: string; // tailwind border/bg color class prefix
  children?: ReactNode;
  sourceHandles?: Array<{ id: string; label?: string; position?: Position }>;
  targetHandle?: boolean;
  hideSourceHandle?: boolean;
}

function BaseNode({
  id,
  icon,
  title,
  color,
  children,
  selected,
  data,
  sourceHandles,
  targetHandle = true,
  hideSourceHandle = false,
}: BaseNodeProps) {
  const { nodes: _, ...store } = useNodesStore();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    useNodesStore.setState((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
    }));
  };

  const isActive = data?._isActive as boolean;

  return (
    <div
      className={`
        relative min-w-[180px] bg-[#fffdfb] rounded-xl border-2 shadow-lg transition-all
        ${selected ? 'border-[#ef6c3e] shadow-[#ef6c3e]/20' : `border-[#e4cec1] hover:border-[#dcb9a6]`}
        ${isActive ? 'node-active border-[#ef6c3e]' : ''}
      `}
    >
      {targetHandle && (
        <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[#b99988] !border-2 !border-[#e4cec1]" />
      )}

      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-md ${color} flex items-center justify-center flex-shrink-0`}>
              {icon}
            </div>
            <span className="text-xs font-semibold text-[#32272c]">
              {(data?.label as string) || title}
            </span>
          </div>
          {selected && (
            <button
              onClick={handleDelete}
              className="text-[#9a7c6d] hover:text-[#b9382f] transition-colors ml-2"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        {children && <div className="mt-1">{children}</div>}
      </div>

      {!hideSourceHandle && !sourceHandles && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-[#ef6c3e] !border-2 !border-[#e4cec1]"
        />
      )}

      {sourceHandles && sourceHandles.map((handle, idx) => {
        const pos = handle.position ?? Position.Bottom;
        const isBottom = pos === Position.Bottom;
        const total = sourceHandles.length;
        const leftPct = total > 1 ? `${((idx + 1) / (total + 1)) * 100}%` : '50%';
        const topPct = total > 1 ? `${((idx + 1) / (total + 1)) * 100}%` : '50%';
        return (
          <Handle
            key={handle.id}
            type="source"
            position={pos}
            id={handle.id}
            className="!w-3 !h-3 !bg-[#ef6c3e] !border-2 !border-[#e4cec1]"
            style={isBottom
              ? { left: leftPct, transform: 'translateX(-50%)' }
              : { top: topPct, transform: 'translateY(-50%)' }
            }
          >
            {handle.label && isBottom && (
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-[#96766a] whitespace-nowrap pointer-events-none">
                {handle.label}
              </span>
            )}
          </Handle>
        );
      })}
    </div>
  );
}

export default memo(BaseNode);
