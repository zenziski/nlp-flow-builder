import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Trash2, ChevronDown, ChevronRight, Cpu, RefreshCw } from 'lucide-react';
import { nlpService } from '../services/nlp.service';
import type { Intent } from '../types/nlp.types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function NlpPage() {
  const { botId } = useParams<{ botId: string }>();
  if (!botId) return <Navigate to="/bots" replace />;

  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [trainMsg, setTrainMsg] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // new intent form
  const [newIntentName, setNewIntentName] = useState('');
  const [creating, setCreating] = useState(false);

  // per-intent new example
  const [newExample, setNewExample] = useState<Record<string, string>>({});
  // per-intent new answer
  const [newAnswer, setNewAnswer] = useState<Record<string, string>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    nlpService.getIntents(botId).then((data) => {
      setIntents(data);
      setLoading(false);
    });
  }, [botId]);

  const handleCreateIntent = async () => {
    if (!newIntentName.trim()) return;
    setCreating(true);
    try {
      const intent = await nlpService.createIntent({
        botId,
        name: newIntentName.trim(),
        examples: [],
        answers: [],
        entities: [],
        language: 'pt',
      });
      setIntents((prev) => [...prev, intent]);
      setNewIntentName('');
      setExpandedId(intent._id);
      toast.success(`Intent "${intent.name}" created`);
    } catch {
      toast.error('Failed to create intent');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteIntent = async (id: string) => {
    try {
      await nlpService.deleteIntent(id);
      setIntents((prev) => prev.filter((i) => i._id !== id));
      if (expandedId === id) setExpandedId(null);
      setConfirmDeleteId(null);
      toast.success('Intent deleted');
    } catch {
      toast.error('Failed to delete intent');
    }
  };

  const handleAddExample = async (intent: Intent) => {
    const text = (newExample[intent._id] ?? '').trim();
    if (!text) return;
    try {
      const updated = await nlpService.updateIntent(intent._id, {
        examples: [...intent.examples, text],
      });
      setIntents((prev) => prev.map((i) => (i._id === intent._id ? updated : i)));
      setNewExample((prev) => ({ ...prev, [intent._id]: '' }));
    } catch {
      toast.error('Failed to add example');
    }
  };

  const handleRemoveExample = async (intent: Intent, idx: number) => {
    try {
      const updated = await nlpService.updateIntent(intent._id, {
        examples: intent.examples.filter((_, i) => i !== idx),
      });
      setIntents((prev) => prev.map((i) => (i._id === intent._id ? updated : i)));
    } catch {
      toast.error('Failed to remove example');
    }
  };

  const handleAddAnswer = async (intent: Intent) => {
    const text = (newAnswer[intent._id] ?? '').trim();
    if (!text) return;
    try {
      const updated = await nlpService.updateIntent(intent._id, {
        answers: [...intent.answers, text],
      });
      setIntents((prev) => prev.map((i) => (i._id === intent._id ? updated : i)));
      setNewAnswer((prev) => ({ ...prev, [intent._id]: '' }));
    } catch {
      toast.error('Failed to add answer');
    }
  };

  const handleRemoveAnswer = async (intent: Intent, idx: number) => {
    try {
      const updated = await nlpService.updateIntent(intent._id, {
        answers: intent.answers.filter((_, i) => i !== idx),
      });
      setIntents((prev) => prev.map((i) => (i._id === intent._id ? updated : i)));
    } catch {
      toast.error('Failed to remove answer');
    }
  };

  const handleTrain = async () => {
    setTraining(true);
    setTrainMsg('');
    try {
      await nlpService.train(botId);
      setTrainMsg('Model trained successfully!');
      toast.success('Model trained successfully');
    } catch (e: any) {
      const msg = e.message ?? 'Training failed.';
      setTrainMsg(msg);
      toast.error(msg);
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-3 py-4 md:px-4 md:py-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2 !text-3xl md:!text-4xl">
            <Cpu className="w-6 h-6 text-[var(--brand)]" /> NLP Training
          </h1>
          <p className="page-subtitle text-sm mt-1">Manage intents and training phrases, then retrain the model.</p>
        </div>
        <Button onClick={handleTrain} isLoading={training} variant="primary">
          <RefreshCw className="w-4 h-4" /> Train Model
        </Button>
      </div>

      {trainMsg && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm border ${trainMsg.includes('success') ? 'bg-[#dff4eb] border-[#0f766e] text-[#0f766e]' : 'bg-[#fde4dd] border-[#b9382f] text-[#b9382f]'}`}>
          {trainMsg}
        </div>
      )}

      {/* New intent */}
      <div className="flex gap-2 mb-6">
        <Input
          value={newIntentName}
          onChange={(e) => setNewIntentName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateIntent()}
          placeholder="New intent name (e.g. greet, farewell)"
          className="flex-1"
        />
        <Button onClick={handleCreateIntent} isLoading={creating}>
          <Plus className="w-4 h-4" /> Add Intent
        </Button>
      </div>

      {loading ? (
        <p className="text-[#6f5346] text-sm">Loading intents...</p>
      ) : intents.length === 0 ? (
        <div className="surface-panel border-dashed p-8 text-center">
          <Cpu className="w-8 h-8 text-[#816354] mx-auto mb-3" />
          <p className="text-[#6f5346] text-sm">No intents yet. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {intents.map((intent) => {
            const isOpen = expandedId === intent._id;
            return (
              <div key={intent._id} className="surface-panel overflow-hidden">
                {/* Header */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#fff1e6] transition-colors"
                  onClick={() => setExpandedId(isOpen ? null : intent._id)}
                >
                  <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown className="w-4 h-4 text-[#6f5346]" /> : <ChevronRight className="w-4 h-4 text-[#6f5346]" />}
                    <span className="font-medium text-[#2b1f25] text-sm font-mono">{intent.name}</span>
                    <span className="text-xs text-[#6f5346] bg-[#fff1e6] px-1.5 py-0.5 rounded border border-[#e2c7b8]">
                      {intent.examples.length} example{intent.examples.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-[#6f5346] bg-[#fff1e6] px-1.5 py-0.5 rounded border border-[#e2c7b8]">
                      {intent.answers.length} answer{intent.answers.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {confirmDeleteId === intent._id ? (
                      <>
                        <span className="text-xs text-[#b9382f] font-medium">Delete?</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteIntent(intent._id); }}
                          className="text-xs px-1.5 py-0.5 bg-[#b9382f] text-white rounded hover:bg-[#9b2e25]"
                        >Yes</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                          className="text-xs px-1.5 py-0.5 border border-[#e2c7b8] rounded hover:bg-[#fff1e6]"
                        >No</button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(intent._id); }}
                        className="text-[#8a6959] hover:text-[#b9382f] transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Examples */}
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-[#e2c7b8]">
                    <p className="text-xs text-[#765a4d] uppercase tracking-wider font-semibold mt-3 mb-2">Training phrases</p>
                    <div className="space-y-1 mb-3">
                      {intent.examples.length === 0 ? (
                        <p className="text-xs text-[#816354] italic">No examples yet - add some below.</p>
                      ) : (
                        intent.examples.map((ex, idx) => (
                          <div key={idx} className="flex items-center gap-2 group">
                            <span className="flex-1 text-xs text-[#3f2f35] bg-[#fff1e6] px-2 py-1.5 rounded border border-[#d7b9a9]">
                              {ex}
                            </span>
                            <button
                              onClick={() => handleRemoveExample(intent, idx)}
                              className="text-[#8a6959] hover:text-[#b9382f] opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={newExample[intent._id] ?? ''}
                        onChange={(e) => setNewExample((prev) => ({ ...prev, [intent._id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddExample(intent)}
                        placeholder="Type a training phrase and press Enter"
                        className="flex-1 px-2 py-1.5 rounded bg-white border border-[#d7b9a9] text-xs text-[#2b1f25] placeholder-[#816354] focus:outline-none focus:ring-1 focus:ring-[#d35a2f]"
                      />
                      <button
                        onClick={() => handleAddExample(intent)}
                        className="px-2 py-1.5 rounded bg-[var(--brand)] hover:bg-[var(--brand-strong)] text-white transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Answers */}
                    <p className="text-xs text-[#765a4d] uppercase tracking-wider font-semibold mt-4 mb-2">Answers</p>
                    <div className="space-y-1 mb-3">
                      {intent.answers.length === 0 ? (
                        <p className="text-xs text-[#816354] italic">No answers yet — add some below.</p>
                      ) : (
                        intent.answers.map((ans, idx) => (
                          <div key={idx} className="flex items-center gap-2 group">
                            <span className="flex-1 text-xs text-[#3f2f35] bg-[#f0f9ff] px-2 py-1.5 rounded border border-[#bae0f9]">
                              {ans}
                            </span>
                            <button
                              onClick={() => handleRemoveAnswer(intent, idx)}
                              className="text-[#8a6959] hover:text-[#b9382f] opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={newAnswer[intent._id] ?? ''}
                        onChange={(e) => setNewAnswer((prev) => ({ ...prev, [intent._id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddAnswer(intent)}
                        placeholder="Type a bot reply and press Enter"
                        className="flex-1 px-2 py-1.5 rounded bg-white border border-[#bae0f9] text-xs text-[#2b1f25] placeholder-[#816354] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                      />
                      <button
                        onClick={() => handleAddAnswer(intent)}
                        className="px-2 py-1.5 rounded bg-[#3b82f6] hover:bg-[#2563eb] text-white transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
