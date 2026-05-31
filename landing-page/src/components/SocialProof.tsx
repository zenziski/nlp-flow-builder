import { useReveal } from '../hooks/useReveal';

const stats = [
  { value: '10K+', label: 'Bots created', sub: 'and growing every day' },
  { value: '50M+', label: 'Conversations handled', sub: 'across all industries' },
  { value: '99.9%', label: 'Uptime SLA', sub: 'enterprise-grade reliability' },
  { value: '120+', label: 'Countries reached', sub: 'global infrastructure' },
];

const testimonials = [
  {
    quote:
      '"Zenflow cut our chatbot development time by 80%. The visual builder is genuinely a joy to use — our team picked it up in an afternoon."',
    name: 'Sarah Chen',
    role: 'Head of Customer Experience',
    company: 'Lumio Health',
    avatar: 'SC',
    avatarBg: '#ffe6d8',
    avatarColor: '#ef6c3e',
  },
  {
    quote:
      '"The NLP training is so intuitive that our non-technical team now updates conversation flows themselves. No tickets, no waiting. Pure velocity."',
    name: 'Marcus Obi',
    role: 'Product Lead',
    company: 'Stride Commerce',
    avatar: 'MO',
    avatarBg: 'rgba(15,118,110,0.12)',
    avatarColor: '#0f766e',
  },
  {
    quote:
      '"Finally a chatbot platform that doesn\'t feel like it was built in 2012. The design is clean, the builder is fast, and the results speak for themselves."',
    name: 'Camila Rocha',
    role: 'CTO',
    company: 'Vantage Finance',
    avatar: 'CR',
    avatarBg: '#ffe6d8',
    avatarColor: '#d35a2f',
  },
];

export default function SocialProof() {
  const statsReveal = useReveal<HTMLDivElement>();
  const testimonialsHeader = useReveal<HTMLDivElement>();
  const testimonialsGrid = useReveal<HTMLDivElement>(0.05);
  return (
    <>
      {/* Stats */}
      <section className="bg-white py-16 border-y" style={{ borderColor: '#ebd6cc' }}>
        <div className="mx-auto max-w-6xl px-5">
          <div ref={statsReveal.ref} className={`grid grid-cols-2 gap-8 lg:grid-cols-4 reveal ${statsReveal.visible ? 'is-visible' : ''}`}>
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="text-4xl font-bold md:text-5xl"
                  style={{ fontFamily: 'Sora, sans-serif', color: '#ef6c3e', letterSpacing: '-0.02em' }}
                >
                  {stat.value}
                </p>
                <p className="mt-1.5 text-sm font-bold" style={{ color: '#2a2127' }}>
                  {stat.label}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: '#9f7969' }}>
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24" style={{ background: '#fff7f2' }}>
        <div className="mx-auto max-w-6xl px-5">
          <div ref={testimonialsHeader.ref} className={`mb-14 text-center reveal ${testimonialsHeader.visible ? 'is-visible' : ''}`}>
            <p className="section-label mb-3">Testimonials</p>
            <h2 className="section-title mb-4">Loved by teams who care about experience</h2>
            <p className="section-subtitle mx-auto max-w-md">
              Don't take our word for it — here's what builders say after switching to Zenflow.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="surface-card p-7 flex flex-col gap-5 hover:-translate-y-1 transition-transform duration-300"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="h-4 w-4" viewBox="0 0 20 20" fill="#ef6c3e">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="flex-1 text-sm leading-relaxed italic" style={{ color: '#4a3540' }}>
                  {t.quote}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: '#ebd6cc' }}>
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                    style={{ background: t.avatarBg, color: t.avatarColor }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#2a2127' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: '#9f7969' }}>
                      {t.role} · {t.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
