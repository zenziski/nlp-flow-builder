import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useFlowStore } from '../stores/useFlowStore';

export function useAutoSave(enabled = true, delayMs = 2000) {
  const { isDirty, saveCanvas } = useFlowStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !isDirty) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveCanvas().catch(() => {
        toast.error('Auto-save failed — please save manually');
      });
    }, delayMs);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isDirty, enabled, delayMs]);
}
