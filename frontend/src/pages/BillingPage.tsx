import { useEffect, useState } from 'react';
import {
  CreditCard,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  MinusCircle,
  ChevronRight,
  Receipt,
  Lock,
} from 'lucide-react';
import { useBillingStore } from '../stores/useBillingStore';
import { useAuthStore } from '../stores/useAuthStore';
import type { InvoiceStatus, SavePaymentMethodPayload } from '../types/billing.types';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatPeriod(start: string, end: string): string {
  const s = new Date(start);
  return s.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function cardBrandIcon(brand: string): string {
  const b = brand.toLowerCase();
  if (b.includes('visa')) return '💳';
  if (b.includes('master')) return '💳';
  if (b.includes('amex')) return '💳';
  return '💳';
}

// ── Status badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const map: Record<
    InvoiceStatus,
    { label: string; icon: React.ReactNode; cls: string }
  > = {
    paid: {
      label: 'Paid',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    },
    pending: {
      label: 'Pending',
      icon: <Clock className="h-3.5 w-3.5" />,
      cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    },
    failed: {
      label: 'Failed',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      cls: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    },
    no_usage: {
      label: 'No usage',
      icon: <MinusCircle className="h-3.5 w-3.5" />,
      cls: 'bg-slate-50 text-slate-500 ring-1 ring-slate-200',
    },
  };
  const { label, icon, cls } = map[status] ?? map.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {icon}
      {label}
    </span>
  );
}

// ── Card form modal ────────────────────────────────────────────────────────

const EMPTY_FORM: SavePaymentMethodPayload = {
  card: { holderName: '', number: '', expiryMonth: '', expiryYear: '', ccv: '' },
  holderInfo: {
    name: '',
    email: '',
    cpfCnpj: '',
    postalCode: '',
    addressNumber: '',
    phone: '',
  },
};

function CardFormModal({ onClose }: { onClose: () => void }) {
  const { savePaymentMethod, isSaving } = useBillingStore();
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState<SavePaymentMethodPayload>({
    ...EMPTY_FORM,
    holderInfo: {
      ...EMPTY_FORM.holderInfo,
      name: user?.name ?? '',
      email: user?.email ?? '',
    },
  });

  function setCard(field: keyof SavePaymentMethodPayload['card'], value: string) {
    setForm((f) => ({ ...f, card: { ...f.card, [field]: value } }));
  }
  function setInfo(field: keyof SavePaymentMethodPayload['holderInfo'], value: string) {
    setForm((f) => ({ ...f, holderInfo: { ...f.holderInfo, [field]: value } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await savePaymentMethod(form);
      onClose();
    } catch {
      // error already toasted
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#ead5c8] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ead5c8] px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand)] shadow-[0_8px_16px_-8px_rgba(239,108,62,0.8)]">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Add credit card
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {/* Card data */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#9e7f6f]">
              Card details
            </p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Name on card
                </label>
                <input
                  required
                  value={form.card.holderName}
                  onChange={(e) => setCard('holderName', e.target.value.toUpperCase())}
                  placeholder="FULL NAME"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Card number
                </label>
                <input
                  required
                  value={form.card.number}
                  onChange={(e) =>
                    setCard('number', e.target.value.replace(/\D/g, '').slice(0, 16))
                  }
                  placeholder="0000 0000 0000 0000"
                  className="input-field w-full font-mono tracking-wider"
                  inputMode="numeric"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Month
                  </label>
                  <input
                    required
                    value={form.card.expiryMonth}
                    onChange={(e) =>
                      setCard('expiryMonth', e.target.value.replace(/\D/g, '').slice(0, 2))
                    }
                    placeholder="MM"
                    maxLength={2}
                    className="input-field w-full text-center font-mono"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Year
                  </label>
                  <input
                    required
                    value={form.card.expiryYear}
                    onChange={(e) =>
                      setCard('expiryYear', e.target.value.replace(/\D/g, '').slice(0, 4))
                    }
                    placeholder="YYYY"
                    maxLength={4}
                    className="input-field w-full text-center font-mono"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    CVV
                  </label>
                  <input
                    required
                    type="password"
                    value={form.card.ccv}
                    onChange={(e) =>
                      setCard('ccv', e.target.value.replace(/\D/g, '').slice(0, 4))
                    }
                    placeholder="•••"
                    maxLength={4}
                    className="input-field w-full text-center font-mono"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Holder info */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#9e7f6f]">
              Cardholder info
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Full name
                  </label>
                  <input
                    required
                    value={form.holderInfo.name}
                    onChange={(e) => setInfo('name', e.target.value)}
                    placeholder="John Smith"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={form.holderInfo.email}
                    onChange={(e) => setInfo('email', e.target.value)}
                    placeholder="joao@email.com"
                    className="input-field w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    CPF / CNPJ
                  </label>
                  <input
                    required
                    value={form.holderInfo.cpfCnpj}
                    onChange={(e) =>
                      setInfo('cpfCnpj', e.target.value.replace(/\D/g, '').slice(0, 14))
                    }
                    placeholder="00000000000"
                    className="input-field w-full font-mono"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Phone
                  </label>
                  <input
                    required
                    value={form.holderInfo.phone}
                    onChange={(e) =>
                      setInfo('phone', e.target.value.replace(/\D/g, '').slice(0, 11))
                    }
                    placeholder="11999999999"
                    className="input-field w-full font-mono"
                    inputMode="tel"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Postal code
                  </label>
                  <input
                    required
                    value={form.holderInfo.postalCode}
                    onChange={(e) =>
                      setInfo('postalCode', e.target.value.replace(/\D/g, '').slice(0, 8))
                    }
                    placeholder="00000000"
                    className="input-field w-full font-mono"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Address number
                  </label>
                  <input
                    required
                    value={form.holderInfo.addressNumber}
                    onChange={(e) => setInfo('addressNumber', e.target.value)}
                    placeholder="123"
                    className="input-field w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-2 rounded-xl bg-[#fff6f0] px-3 py-2.5 text-xs text-[#9e7f6f]">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--brand)]" />
            <span>
              Your data is transmitted securely directly to{' '}
              <span className="font-semibold text-slate-700">Asaas</span>. The CVV
              is never stored on our servers.
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-[#ead5c8] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#ead5c8] py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-xl bg-[#d35a2f] py-2 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(211,90,47,0.7)] transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving…
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  Save card
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function BillingPage() {
  const {
    paymentMethod,
    invoices,
    isLoading,
    isSaving,
    fetchPaymentMethod,
    fetchInvoices,
    removePaymentMethod,
  } = useBillingStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPaymentMethod();
    fetchInvoices();
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-3 py-4 md:px-4 md:py-5">
      <div>
        <h1 className="page-title">Billing</h1>
        <p className="mt-1 text-sm text-[#9e7f6f]">
          Manage your payment method and view your invoice history.
        </p>
      </div>

      {/* Pricing note */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#efd6ca] bg-[#fff8f4] px-4 py-3.5">
        <Receipt className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
        <p className="text-sm text-[#7a5f52]">
          You are charged <span className="font-bold text-slate-800">R$ 0.10</span> per session
          started across all your bots. Billing is processed monthly to the registered card.
        </p>
      </div>

      {/* Payment Method */}
      <section className="surface-panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#efd6ca] px-5 py-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[var(--brand)]" />
            <h2 className="text-sm font-bold text-slate-900">Payment method</h2>
          </div>
          {!paymentMethod && !isLoading && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add card
            </button>
          )}
        </div>

        <div className="px-5 py-5">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-[#9e7f6f]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#efd6ca] border-t-[var(--brand)]" />
              Loading…
            </div>
          ) : paymentMethod ? (
            <div className="flex items-center justify-between">
              {/* Card display */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] shadow-md">
                  <CreditCard className="h-6 w-6 text-white/80" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {paymentMethod.cardBrand} •••• {paymentMethod.cardLastFour}
                  </p>
                  <p className="text-xs text-[#9e7f6f]">{paymentMethod.holderName}</p>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-[#e9d4c8] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-[#fff1e9]"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Replace
                </button>
                <button
                  onClick={removePaymentMethod}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1e9]">
                <CreditCard className="h-6 w-6 text-[var(--brand)]" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">No card on file</p>
                <p className="mt-0.5 text-xs text-[#9e7f6f]">
                  Add a card so your monthly charges are processed automatically.
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add credit card
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Invoices */}
      <section className="surface-panel overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[#efd6ca] px-5 py-4">
          <Receipt className="h-4 w-4 text-[var(--brand)]" />
          <h2 className="text-sm font-bold text-slate-900">Invoice history</h2>
        </div>

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Receipt className="h-8 w-8 text-[#d4bfb5]" />
            <p className="text-sm text-[#9e7f6f]">No invoices found yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f5e8e0]">
            {invoices.map((inv) => (
              <div
                key={inv._id}
                className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-[#fffaf7]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff1e9]">
                    <Receipt className="h-4 w-4 text-[var(--brand)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold capitalize text-slate-900">
                      {formatPeriod(inv.periodStart, inv.periodEnd)}
                    </p>
                    <p className="text-xs text-[#9e7f6f]">
                      {inv.sessionCount} session{inv.sessionCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={inv.status} />
                  <span className="w-20 text-right text-sm font-bold text-slate-900">
                    {inv.status === 'no_usage' ? '—' : formatBRL(inv.amountCents)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#c9b0a5]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Card form modal */}
      {showForm && <CardFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}
