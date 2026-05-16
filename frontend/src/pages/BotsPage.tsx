import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Bot, Trash2, ExternalLink, Cpu } from 'lucide-react';
import { useBotStore } from '../stores/useBotStore';
import { useFlowStore } from '../stores/useFlowStore';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import type { Bot as BotType } from '../types/bot.types';

export default function BotsPage() {
  const navigate = useNavigate();
  const { bots, fetchBots, createBot, deleteBot, isLoading } = useBotStore();
  const { flows, fetchFlows, createFlow } = useFlowStore();
  const [showCreateBot, setShowCreateBot] = useState(false);
  const [showCreateFlow, setShowCreateFlow] = useState(false);
  const [selectedBot, setSelectedBot] = useState<BotType | null>(null);
  const [botForm, setBotForm] = useState({ name: '', description: '', language: 'pt' });
  const [flowName, setFlowName] = useState('');
  const [creating, setCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchBots(); }, []);

  const handleOpenFlows = (bot: BotType) => {
    setSelectedBot(bot);
    fetchFlows(bot._id);
  };

  const handleCreateBot = async () => {
    if (!botForm.name.trim()) return;
    setCreating(true);
    try {
      await createBot(botForm);
      setShowCreateBot(false);
      setBotForm({ name: '', description: '', language: 'pt' });
      toast.success('Bot created successfully');
    } catch {
      toast.error('Failed to create bot');
    } finally { setCreating(false); }
  };

  const handleCreateFlow = async () => {
    if (!flowName.trim() || !selectedBot) return;
    setCreating(true);
    try {
      const flow = await createFlow(flowName, selectedBot._id);
      setShowCreateFlow(false);
      setFlowName('');
      toast.success(`Flow "${flowName}" created`);
      navigate(`/builder/${selectedBot._id}/${flow._id}`);
    } catch {
      toast.error('Failed to create flow');
    } finally { setCreating(false); }
  };

  const handleDeleteBot = async (id: string) => {
    setDeleting(true);
    try {
      await deleteBot(id);
      setConfirmDeleteId(null);
      toast.success('Bot deleted');
    } catch {
      toast.error('Failed to delete bot');
    } finally {
      setDeleting(false);
    }
  };

  const openBuilder = (botId: string, flowId: string) => {
    navigate(`/builder/${botId}/${flowId}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 md:px-4 md:py-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title">Bot Projects</h1>
          <p className="page-subtitle mt-1">Create and refine conversation experiences with your team.</p>
        </div>
        <Button onClick={() => setShowCreateBot(true)}>
          <Plus className="w-4 h-4" /> New Bot
        </Button>
      </div>

      {isLoading ? (
        <div className="surface-panel p-6 text-sm text-slate-600">Loading bots...</div>
      ) : bots.length === 0 ? (
        <div className="surface-panel border-dashed p-12 text-center">
          <Bot className="mx-auto mb-3 h-10 w-10 text-slate-500" />
          <p className="font-semibold text-slate-900">No projects yet</p>
          <p className="mt-1 text-sm text-[#7e695d]">Start with one bot and grow your conversation library.</p>
          <Button onClick={() => setShowCreateBot(true)} className="mt-4">
            <Plus className="w-4 h-4" /> Create Bot
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <div key={bot._id} className="surface-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_36px_-26px_rgba(133,73,42,0.88)]">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffe6d8]">
                  <Bot className="h-5 w-5 text-[var(--brand)]" />
                </div>
                <div className="flex gap-1">
                  {confirmDeleteId === bot._id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[#b84f2b] font-medium">Delete?</span>
                      <button
                        onClick={() => handleDeleteBot(bot._id)}
                        disabled={deleting}
                        className="text-xs px-1.5 py-0.5 bg-[#b84f2b] text-white rounded hover:bg-[#a0421f] disabled:opacity-50"
                      >{deleting ? '…' : 'Yes'}</button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs px-1.5 py-0.5 border border-[#e4cfc4] rounded hover:bg-[#fff2e8]"
                      >No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(bot._id)} className="p-1 text-slate-500 transition-colors hover:text-[#b84f2b]">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-slate-900">{bot.name}</h3>
              {bot.description && <p className="mt-1 line-clamp-2 text-xs text-[#7e695d]">{bot.description}</p>}
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-md bg-[#f7e0d2] px-2 py-0.5 text-xs text-[#7a4e39]">{bot.language.toUpperCase()}</span>
                <span className={`rounded-md px-2 py-0.5 text-xs ${bot.isActive ? 'bg-[#dff4eb] text-[#0f766e]' : 'bg-[#f2dfd4] text-[#8f6a56]'}`}>
                  {bot.isActive ? 'Live' : 'Paused'}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => handleOpenFlows(bot)} className="flex-1">
                  <ExternalLink className="w-3 h-3" /> Flows
                </Button>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/bots/${bot._id}/nlp`)} className="flex-1">
                  <Cpu className="w-3 h-3" /> NLP
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBot && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Flows for {selectedBot.name}</h2>
            <Button size="sm" onClick={() => setShowCreateFlow(true)}>
              <Plus className="w-3 h-3" /> New Flow
            </Button>
          </div>
          {flows.length === 0 ? (
            <p className="surface-panel p-4 text-sm text-slate-600">No flows yet. Create one!</p>
          ) : (
            <div className="space-y-2.5">
              {flows.map((flow) => (
                <div key={flow._id} className="surface-panel flex items-center justify-between p-3.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{flow.name}</p>
                    <p className="text-xs text-[#7e695d]">v{flow.version} · {flow.published ? 'Published' : 'Draft'}</p>
                  </div>
                  <Button size="sm" onClick={() => openBuilder(selectedBot._id, flow._id)}>
                    Open Builder
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={showCreateBot}
        onClose={() => setShowCreateBot(false)}
        title="Create New Bot"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreateBot(false)}>Cancel</Button>
            <Button onClick={handleCreateBot} isLoading={creating}>Create</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Name" value={botForm.name} onChange={(e) => setBotForm({ ...botForm, name: e.target.value })} placeholder="e.g. Customer Support Bot" required />
          <Input label="Description (optional)" value={botForm.description} onChange={(e) => setBotForm({ ...botForm, description: e.target.value })} placeholder="What does this bot do?" />
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700">Language</label>
            <select
              value={botForm.language}
              onChange={(e) => setBotForm({ ...botForm, language: e.target.value })}
              className="w-full rounded-2xl border border-[#e4cfc4] bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/25"
            >
              <option value="pt">Portuguese (pt)</option>
              <option value="en">English (en)</option>
              <option value="es">Spanish (es)</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showCreateFlow}
        onClose={() => setShowCreateFlow(false)}
        title="Create New Flow"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreateFlow(false)}>Cancel</Button>
            <Button onClick={handleCreateFlow} isLoading={creating}>Create & Open Builder</Button>
          </>
        }
      >
        <Input label="Flow Name" value={flowName} onChange={(e) => setFlowName(e.target.value)} placeholder="e.g. Main Support Flow" required />
      </Modal>
    </div>
  );
}
