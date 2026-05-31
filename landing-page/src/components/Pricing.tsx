import { useState } from 'react';
import { Check, Zap } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const plans = [
  {
    name: 'Starter',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for indie builders and small projects getting started.',
    features: [
      '1 bot',
      '1,000 messages / month',
      'Basic NLP (up to 10 intents)',
      'Visual flow builder',
      'Real-time simulator',
      'Community support',
    ],
    cta: 'Start for free',
    highlight: false,
  },
  {
    name: 'Growth',
    price: { monthly: 29, yearly: 23 },
    description: 'For growing teams that need more bots, more power, and collaboration.',
    features: [
      '10 bots',
      '50,000 messages / month',
      'Advanced NLP (unlimited intents)',
      'Team collaboration (up to 5 seats)',
      'Secure Vault',
      'API integrations',
      'Priority email support',
    ],
    cta: 'Get started',
    highlight: true,
    badge: 'Most popular',
  },
  {
    name: 'Enterprise',
    price: { monthly: 99, yearly: 79 },
    description: 'Unlimited scale, custom SLAs, and a dedicated success manager.',
    features: [
      'Unlimited bots',
      'Unlimited messages',
      'Custom NLP models',
      'Unlimited team seats',
      'SSO & advanced roles',
      'Custom API rate limits',
      'Dedicated support',
      'SLA guarantee (99.9%)',
    ],
    cta: 'Contact sales',
    highlight: false,
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const header = useReveal<HTMLDivElement>();
  const plans_reveal = useReveal<HTMLDivElement>(0.05);

  return (
    <section id="pricing" className="bg-white py-24 overflow-hidden">
      <div className="mx-auto max-w-6xl px-5">
        {/* Header */}
        <div ref={header.ref} className={`mb-12 text-center reveal ${header.visible ? 'is-visible' : ''}`}>
          <p className="section-label mb-3">Pricing</p>
          <h2 className="section-title mb-4">
            Simple, transparent pricing
          </h2>
          <p className="section-subtitle mx-auto max-w-md">
            Start free, scale as you grow. No hidden fees, no lock-in.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border p-1.5" style={{ borderColor: '#ebd6cc', background: '#fff0e4' }}>
            <button
              onClick={() => setYearly(false)}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                !yearly ? 'bg-white text-app-text shadow-sm' : 'text-muted hover:text-app-text'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                yearly ? 'bg-white text-app-text shadow-sm' : 'text-muted hover:text-app-text'
              }`}
            >
              Yearly
              <span
                className="rounded-lg px-1.5 py-0.5 text-[10px] font-bold"
                style={{ background: 'rgba(15,118,110,0.1)', color: '#0f766e' }}
              >
                –20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div ref={plans_reveal.ref} className="grid grid-cols-1 gap-5 lg:grid-cols-3 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-card border flex flex-col transition-all duration-300 reveal ${plans_reveal.visible ? 'is-visible' : ''} ${
                plan.highlight
                  ? 'shadow-brand-lg scale-[1.02]'
                  : 'hover:-translate-y-1 hover:shadow-card'
              }`}
              style={{
                borderColor: plan.highlight ? '#ef6c3e' : '#ebd6cc',
                background: plan.highlight
                  ? 'linear-gradient(160deg, #fff5ee 0%, #fff8f2 100%)'
                  : 'rgba(255, 248, 242, 0.6)',
              }}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div
                    className="flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold text-white shadow-brand"
                    style={{ background: 'linear-gradient(135deg, #ef6c3e, #d35a2f)' }}
                  >
                    <Zap className="h-3 w-3" fill="currentColor" />
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className="p-7 flex-1">
                {/* Plan name */}
                <p
                  className="text-xs font-bold uppercase tracking-[0.18em] mb-4"
                  style={{ color: plan.highlight ? '#ef6c3e' : '#9f7969' }}
                >
                  {plan.name}
                </p>

                {/* Price */}
                <div className="flex items-end gap-1 mb-2">
                  {plan.price.monthly === 0 ? (
                    <p className="text-4xl font-bold" style={{ fontFamily: 'Sora', color: '#2a2127' }}>
                      Free
                    </p>
                  ) : (
                    <>
                      <p className="text-4xl font-bold" style={{ fontFamily: 'Sora', color: '#2a2127' }}>
                        ${yearly ? plan.price.yearly : plan.price.monthly}
                      </p>
                      <p className="mb-1.5 text-sm" style={{ color: '#9f7969' }}>/mo</p>
                    </>
                  )}
                </div>
                {plan.price.monthly > 0 && yearly && (
                  <p className="text-xs mb-3" style={{ color: '#0f766e', fontWeight: 600 }}>
                    Billed annually — save ${(plan.price.monthly - plan.price.yearly) * 12}/yr
                  </p>
                )}

                <p className="text-sm mb-6 leading-relaxed" style={{ color: '#75636f' }}>
                  {plan.description}
                </p>

                {/* Features */}
                <ul className="flex flex-col gap-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <div
                        className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-md"
                        style={{
                          background: plan.highlight ? '#ffe6d8' : '#f0f0ee',
                        }}
                      >
                        <Check
                          className="h-2.5 w-2.5"
                          style={{ color: plan.highlight ? '#ef6c3e' : '#0f766e' }}
                          strokeWidth={3}
                        />
                      </div>
                      <span className="text-sm" style={{ color: '#4a3540' }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="px-7 pb-7">
                <a
                  href="#"
                  className={`block text-center rounded-2xl border py-3 text-sm font-semibold transition-all duration-200 active:translate-y-[1px] ${
                    plan.highlight
                      ? 'bg-brand border-brand text-white hover:bg-brand-strong hover:border-brand-strong shadow-brand'
                      : 'bg-white/80 border-line text-app-text hover:bg-white hover:border-[#d0baad]'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="mt-10 text-center text-xs" style={{ color: '#9f7969' }}>
          All plans include SSL, GDPR compliance, and 99.9% uptime. No credit card required for Starter.
        </p>
      </div>
    </section>
  );
}
