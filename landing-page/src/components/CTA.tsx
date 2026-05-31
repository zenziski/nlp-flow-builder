import { ArrowRight, Zap } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

export default function CTA() {
  const reveal = useReveal<HTMLDivElement>();
  return (
    <section className="py-24 overflow-hidden" style={{ background: '#fff7f2' }}>
      <div className="mx-auto max-w-4xl px-5">
        <div
          ref={reveal.ref}
          className={`relative rounded-card border overflow-hidden px-8 py-16 text-center reveal ${reveal.visible ? 'is-visible' : ''}`}
          style={{
            borderColor: '#ebd6cc',
            background: 'linear-gradient(160deg, #fff2e8 0%, #ffe6d8 60%, #ffd6c2 100%)',
            boxShadow: '0 40px 80px -32px rgba(89,45,22,0.35)',
          }}
        >
          {/* Background orbs */}
          <div
            className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full blur-[80px] opacity-40"
            style={{ background: '#ef6c3e' }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-[80px] opacity-25"
            style={{ background: '#0f766e' }}
          />

          {/* Icon */}
          <div
            className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl shadow-brand-lg"
            style={{ background: 'linear-gradient(135deg, #ef6c3e, #d35a2f)' }}
          >
            <Zap className="h-7 w-7 text-white" fill="currentColor" />
          </div>

          <h2
            className="relative text-3xl font-bold md:text-4xl lg:text-5xl mb-4"
            style={{ fontFamily: 'Sora, sans-serif', color: '#2a2127', letterSpacing: '-0.02em' }}
          >
            Ready to build your
            <br />
            first flow?
          </h2>
          <p
            className="relative text-base md:text-lg leading-relaxed mb-10 mx-auto max-w-md"
            style={{ color: '#75636f' }}
          >
            Join 2,400+ teams using Zenflow to ship smarter conversations. Start for free — no
            credit card needed.
          </p>

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#"
              className="btn-primary gap-2 text-base px-8 py-3.5"
              style={{ boxShadow: '0 24px 48px -20px rgba(211,90,47,0.5)' }}
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#" className="btn-secondary text-base px-6 py-3.5">
              Talk to sales
            </a>
          </div>

          <p className="relative mt-6 text-xs" style={{ color: '#9f7969' }}>
            Free forever on the Starter plan. Upgrade when you need it.
          </p>
        </div>
      </div>
    </section>
  );
}
