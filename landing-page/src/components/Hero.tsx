export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* ── Blobs ─────────────────────────────────────── */}
      {/* Orange — top-left */}
      <div
        className="blob"
        style={{
          width: 640,
          height: 640,
          background: '#ef6c3e',
          opacity: 0.45,
          filter: 'blur(60px)',
          top: -180,
          left: -180,
          animation: 'blob1 14s ease-in-out infinite',
        }}
      />
      {/* Teal — bottom-right */}
      <div
        className="blob"
        style={{
          width: 520,
          height: 520,
          background: '#0f766e',
          opacity: 0.35,
          filter: 'blur(55px)',
          bottom: -140,
          right: -120,
          animation: 'blob2 18s ease-in-out infinite',
        }}
      />
      {/* Warm peach — upper-right */}
      <div
        className="blob"
        style={{
          width: 440,
          height: 440,
          background: '#f0a070',
          opacity: 0.4,
          filter: 'blur(50px)',
          top: '15%',
          right: '8%',
          animation: 'blob3 11s ease-in-out infinite',
        }}
      />
      {/* Cream — lower-left, very subtle */}
      <div
        className="blob"
        style={{
          width: 360,
          height: 360,
          background: '#ffe6d8',
          opacity: 0.75,
          filter: 'blur(45px)',
          bottom: '18%',
          left: '12%',
          animation: 'blob1 20s ease-in-out infinite reverse',
        }}
      />

      {/* ── Title ─────────────────────────────────────── */}
      <h1
        className="relative z-10 font-bold select-none"
        style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: 'clamp(4.5rem, 13vw, 12rem)',
          letterSpacing: '-0.035em',
          color: '#2a2127',
          lineHeight: 1,
        }}
      >
        <span style={{ color: '#ef6c3e' }}>Zen</span>flow
      </h1>

      {/* ── Scroll caret ──────────────────────────────── */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ opacity: 0.28 }}
      >
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: '#2a2127' }}
        >
          scroll
        </span>
        {[0, 1, 2].map((i) => (
          <svg
            key={i}
            width="14"
            height="8"
            viewBox="0 0 14 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              animation: 'scrollCaret 1.8s ease-in-out infinite',
              animationDelay: `${i * 0.26}s`,
              marginTop: i === 0 ? 0 : -4,
            }}
          >
            <path
              d="M1 1 L7 7 L13 1"
              stroke="#2a2127"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </div>
    </section>
  );
}
