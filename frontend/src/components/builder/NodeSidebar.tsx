import { NODE_PALETTE } from '../nodes';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NodeSidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('nodeType', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="flow-editor-pane border-r flex-shrink-0 flex flex-col overflow-hidden transition-all duration-200"
      style={{ width: isOpen ? '208px' : '28px' }}
    >
      {/* Toggle button — always visible */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        title={isOpen ? 'Close node library' : 'Open node library'}
        className="flex items-center justify-center h-8 flex-shrink-0 border-b border-[#e8d4c8] bg-[#fdf6f0] hover:bg-[#fff2e8] text-[#9a7c6d] hover:text-[#5f4340] transition-colors"
      >
        {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {/* Content — only rendered when open */}
      {isOpen && (
        <div className="overflow-y-auto flex-1">
          <div className="p-3 border-b border-[#e8d4c8]">
            <p className="text-xs font-semibold text-[#7b5e51] uppercase tracking-wider">Nodes</p>
            <p className="text-xs text-[#9f806f] mt-0.5">Drag onto canvas</p>
          </div>
          <div className="p-2 space-y-3">
            {NODE_PALETTE.map((category) => (
              <div key={category.category}>
                <p className="text-xs font-semibold text-[#8f6e5e] uppercase tracking-wider px-1 mb-1">
                  {category.category}
                </p>
                <div className="space-y-1">
                  {category.nodes.map((node) => (
                    <div
                      key={node.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, node.type)}
                      className="flex flex-col px-2.5 py-2 rounded-lg bg-[#fffdfb] hover:bg-[#fff2e8] cursor-grab active:cursor-grabbing transition-colors border border-[#e6d3c6] hover:border-[#dbbaa8] select-none"
                    >
                      <span className="text-xs font-medium text-[#3b2f36]">{node.label}</span>
                      <span className="text-xs text-[#8f6f60] mt-0.5">{node.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
