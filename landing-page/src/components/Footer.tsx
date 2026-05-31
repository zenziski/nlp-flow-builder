import { Zap } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const footerLinks = {
  Product: ['Features', 'How it works', 'Pricing', 'Changelog', 'Roadmap'],
  Resources: ['Documentation', 'API Reference', 'Blog', 'Status', 'Templates'],
  Company: ['About', 'Careers', 'Press', 'Contact', 'Privacy'],
};

export default function Footer() {
  const reveal = useReveal<HTMLElement>();
  return (
    <footer
      ref={reveal.ref}
      className={`border-t py-16 reveal ${reveal.visible ? 'is-visible' : ''}`}
      style={{ background: '#ffffff', borderColor: '#ebd6cc' }}
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:gap-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand shadow-brand">
                <Zap className="h-4 w-4 text-white" fill="currentColor" />
              </div>
              <span
                className="text-lg font-bold tracking-tight"
                style={{ fontFamily: 'Sora, sans-serif', color: '#2a2127' }}
              >
                Zenflow
              </span>
            </a>
            <p className="text-sm leading-relaxed mb-5" style={{ color: '#75636f' }}>
              The visual NLP flow builder for modern teams. Design, train, and deploy AI
              conversations — no code required.
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#0f766e] animate-pulse" />
              <span className="text-xs font-medium" style={{ color: '#0f766e' }}>
                All systems operational
              </span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: '#9f7969' }}>
                {group}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm font-medium transition-colors duration-150 hover:text-brand"
                      style={{ color: '#75636f' }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-14 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
          style={{ borderColor: '#ebd6cc' }}
        >
          <p className="text-xs" style={{ color: '#9f7969' }}>
            © {new Date().getFullYear()} Zenflow. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {['Terms', 'Privacy', 'Cookies'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs font-medium transition-colors hover:text-brand"
                style={{ color: '#9f7969' }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
