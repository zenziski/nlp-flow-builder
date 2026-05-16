import { useEffect } from 'react';
import { toast } from 'sonner';
import { useFlowStore } from '../stores/useFlowStore';
import { useNodesStore } from '../stores/useNodesStore';

export function useKeyboardShortcuts() {
  const { saveCanvas } = useFlowStore();
  const { undo, redo } = useNodesStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (!meta) return;

      if (e.key === 's') {
        e.preventDefault();
        saveCanvas()
          .then(() => toast.success('Flow saved'))
          .catch(() => toast.error('Failed to save flow'));
      } else if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveCanvas, undo, redo]);
}
