import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useFlowStore } from '../stores/useFlowStore';
import { useVaultStore } from '../stores/useVaultStore';
import { useAutoSave } from '../hooks/useAutoSave';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import FlowCanvas from '../components/builder/FlowCanvas';
import NodeSidebar from '../components/builder/NodeSidebar';
import Topbar from '../components/builder/Topbar';
import PropertiesPanel from '../components/builder/PropertiesPanel';
import ChatSimulator from '../components/simulator/ChatSimulator';
import { flowsService } from '../services/flows.service';

export default function BuilderPage() {
  const { botId, flowId } = useParams<{ botId: string; flowId: string }>();
  const [showSimulator, setShowSimulator] = useState(false);
  const { setActiveFlow } = useFlowStore();
  const fetchVault = useVaultStore((s) => s.fetch);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useAutoSave(true, 6000);
  useKeyboardShortcuts();

  // Pre-fetch vault so variable suggestions include vault entries
  useEffect(() => { fetchVault(); }, []);

  useEffect(() => {
    if (!botId || !flowId) return;
    setLoading(true);
    flowsService
      .findOne(flowId)
      .then((flow) => {
        setActiveFlow(flow);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message ?? 'Failed to load flow');
        setLoading(false);
      });
  }, [flowId]);

  if (!botId || !flowId) return <Navigate to="/bots" replace />;

  if (loading) {
    return (
      <div className="flow-editor-shell flex h-screen items-center justify-center">
        <div className="flow-editor-muted">Loading flow...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flow-editor-shell flex h-screen items-center justify-center">
        <div className="text-[#b9382f]">{error}</div>
      </div>
    );
  }

  return (
    <div className="flow-editor-shell flex h-screen flex-col overflow-hidden">
      <Topbar
        botId={botId}
        onToggleSimulator={() => setShowSimulator((v) => !v)}
        showSimulator={showSimulator}
      />

      <div className="flex flex-1 overflow-hidden">
        <NodeSidebar />

        <div className="flex-1 relative overflow-hidden">
          <FlowCanvas />
        </div>

        <PropertiesPanel />

        {showSimulator && (
          <ChatSimulator botId={botId} flowId={flowId} />
        )}
      </div>
    </div>
  );
}
