import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Login failed');
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl gap-5 md:grid-cols-2 md:items-stretch">
        <section className="surface-card hidden p-8 md:flex md:flex-col md:justify-between">
          <div>
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)] shadow-[0_14px_30px_-18px_rgba(211,90,47,0.95)]">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Build bots that sound like your brand, not a script.</h1>
            <p className="mt-4 text-sm leading-relaxed text-[#7e695d]">
              Shape each reply, test complete journeys, and launch conversational experiences with personality.
            </p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8f7365]">NLP BUILDER</p>
        </section>

        <div className="surface-panel w-full max-w-md justify-self-center p-6 md:p-7">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand)] shadow-[0_14px_30px_-18px_rgba(211,90,47,0.95)] md:hidden">
              <Bot className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
            <p className="mt-1 text-sm text-[#7e695d]">Pick up right where your bot stories stopped.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-xl border border-[#efcab9] bg-[#fff0e7] px-3 py-2 text-sm text-[#a34729]">{error}</div>}
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full" isLoading={isLoading}>Sign In</Button>
          </form>

          <p className="mt-4 text-center text-sm text-[#7e695d]">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[var(--brand)] hover:text-[var(--brand-strong)]">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
