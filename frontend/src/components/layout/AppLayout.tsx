import { Outlet, NavLink } from 'react-router-dom';
import { Bot, LayoutDashboard, Settings, LogOut, BarChart2, MessagesSquare } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/bots', icon: Bot, label: 'Bots' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/conversations', icon: MessagesSquare, label: 'Conversations' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="app-shell flex min-h-screen bg-white p-3 text-slate-900 md:p-5">
      <aside className="surface-panel z-10 flex w-20 flex-shrink-0 flex-col md:w-64 sticky top-3 md:top-5 self-start h-[calc(100vh-1.5rem)] md:h-[calc(100vh-2.5rem)]">
        <div className="border-b border-[#efd6ca] p-4 md:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)] shadow-[0_16px_30px_-18px_rgba(211,90,47,0.95)]">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#9e7f6f]">Studio</p>
              <span className="block text-sm font-bold text-slate-900">NLP BUILDER</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 p-2 md:p-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[var(--brand)] text-white shadow-[0_14px_26px_-18px_rgba(211,90,47,0.9)]'
                    : 'text-slate-700 hover:bg-[#fff1e9] hover:text-slate-900'
                }`
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="hidden md:block">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#efd6ca] p-2 md:p-3">
          <div className="hidden truncate px-3 py-2 text-xs text-[#907160] md:block">{user?.email}</div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#ffe5d8] hover:text-[#b84f2b]"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="hidden md:block">Logout</span>
          </button>
        </div>
      </aside>

      <main className="relative z-10 ml-3 flex-1 overflow-auto rounded-2xl border border-[#ead5c8] bg-white md:ml-5">
        <div className="mx-auto min-h-full max-w-7xl p-2 md:p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
