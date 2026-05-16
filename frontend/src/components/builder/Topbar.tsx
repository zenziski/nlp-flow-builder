import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Save,
  CheckCircle,
  Upload,
  Download,
  Undo2,
  Redo2,
  Play,
  ChevronLeft,
  AlertCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { useFlowStore } from '../../stores/useFlowStore';
import { useNodesStore } from '../../stores/useNodesStore';
import Button from '../ui/Button';

interface TopbarProps {
  botId: string;
  onToggleSimulator: () => void;
  showSimulator: boolean;
}

export default function Topbar({ botId, onToggleSimulator, showSimulator }: TopbarProps) {
  const { activeFlow, isDirty, isSaving, saveCanvas, publishFlow, validateFlow, exportFlow, validationResult } = useFlowStore();
  const { undo, redo, undoStack, redoStack } = useNodesStore();
  const [showValidation, setShowValidation] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const validationRef = useRef<HTMLDivElement>(null);

  const errorCount = validationResult?.errors.filter((e) => e.type === 'error').length ?? 0;
  const warnCount = validationResult?.errors.filter((e) => e.type === 'warning').length ?? 0;
  const hasIssues = errorCount > 0 || warnCount > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (validationRef.current && !validationRef.current.contains(e.target as Node)) {
        setShowValidation(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleValidate = () => {
    validateFlow();
    setShowValidation(true);
  };

  const handleSave = async () => {
    try {
      await saveCanvas();
      toast.success('Flow saved');
    } catch {
      toast.error('Failed to save flow');
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishFlow();
      toast.success('Flow published successfully');
    } catch {
      toast.error('Failed to publish flow');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportFlow();
      toast.success('Flow exported');
    } catch {
      toast.error('Failed to export flow');
    }
  };

  return (
    <div className="flow-editor-pane h-12 border-b flex items-center px-3 gap-2 flex-shrink-0">
      <Link to={`/bots`} className="flow-editor-muted hover:text-[#b24d2a] mr-1 transition-colors">
        <ChevronLeft className="w-4 h-4" />
      </Link>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="flow-editor-title text-sm font-semibold truncate">{activeFlow?.name ?? 'Flow'}</span>
        {activeFlow && (
          <span className="flow-editor-muted text-xs">v{activeFlow.version}</span>
        )}
        {activeFlow?.published && (
          <span className="text-xs bg-[#dff4eb] text-[#0f766e] px-1.5 py-0.5 rounded">Published</span>
        )}
        {isDirty && (
          <span className="text-xs text-[#b24d2a]">Unsaved changes</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={undoStack.length === 0}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={redoStack.length === 0}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </Button>

        <div className="flow-editor-divider w-px h-5 mx-1" />

        <div className="relative" ref={validationRef}>
          <Button variant="ghost" size="sm" onClick={handleValidate} title="Validate flow">
            {errorCount > 0 ? (
              <AlertCircle className="w-3.5 h-3.5 text-[#b9382f]" />
            ) : warnCount > 0 ? (
              <AlertTriangle className="w-3.5 h-3.5 text-[#b24d2a]" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5 text-[#8b6b59]" />
            )}
            {hasIssues && (
              <span className={`text-xs ${errorCount > 0 ? 'text-[#b9382f]' : 'text-[#b24d2a]'}`}>
                {errorCount > 0 ? `${errorCount} error${errorCount !== 1 ? 's' : ''}` : ''}{errorCount > 0 && warnCount > 0 ? ', ' : ''}{warnCount > 0 ? `${warnCount} warning${warnCount !== 1 ? 's' : ''}` : ''}
              </span>
            )}
            {!hasIssues && validationResult && (
              <span className="text-xs text-[#0f766e]">Valid</span>
            )}
          </Button>

          {showValidation && validationResult && (
            <div className="absolute top-full right-0 mt-1 w-80 bg-[#fffdfb] border border-[#e2cdc0] rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#e2cdc0]">
                <span className="text-xs font-semibold text-[#5f4340]">Validation results</span>
                <button onClick={() => setShowValidation(false)} className="text-[#9a7e6e] hover:text-[#5f4340]">
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              {validationResult.errors.length === 0 ? (
                <div className="flex items-center gap-2 px-3 py-3 text-[#0f766e]">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs">No issues found</span>
                </div>
              ) : (
                <ul className="max-h-64 overflow-y-auto divide-y divide-[#efded3]">
                  {validationResult.errors.map((err, i) => (
                    <li key={i} className="flex items-start gap-2 px-3 py-2">
                      {err.type === 'error' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-[#b9382f] flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-[#b24d2a] flex-shrink-0 mt-0.5" />
                      )}
                      <span className="text-xs text-[#5f4340] leading-snug">{err.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <Button variant="ghost" size="sm" onClick={handleExport} title="Export flow">
          <Download className="w-3.5 h-3.5" />
        </Button>

        <Button
          variant={isDirty ? 'primary' : 'ghost'}
          size="sm"
          onClick={handleSave}
          isLoading={isSaving}
          title="Save (Ctrl+S)"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </Button>

        <Button variant="secondary" size="sm" onClick={handlePublish} isLoading={isPublishing}>
          <Upload className="w-3.5 h-3.5" />
          Publish
        </Button>

        <div className="flow-editor-divider w-px h-5 mx-1" />

        <Button
          variant={showSimulator ? 'primary' : 'ghost'}
          size="sm"
          onClick={onToggleSimulator}
        >
          <Play className="w-3.5 h-3.5" />
          {showSimulator ? 'Hide' : 'Test'}
        </Button>
      </div>
    </div>
  );
}
