import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function RegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(form.name, form.email, form.password);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Registration failed');
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-8">
      <div className="surface-panel w-full max-w-md p-6 md:p-7">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand)] shadow-[0_14px_30px_-18px_rgba(211,90,47,0.95)]">
            <Bot className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
          <p className="mt-1 text-sm text-[#7e695d]">Start your studio and build conversational stories.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-xl border border-[#efcab9] bg-[#fff0e7] px-3 py-2 text-sm text-[#a34729]">{error}</div>}
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
          <Button type="submit" className="w-full" isLoading={isLoading}>Create Account</Button>
        </form>

        <p className="mt-4 text-center text-sm text-[#7e695d]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[var(--brand)] hover:text-[var(--brand-strong)]">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
