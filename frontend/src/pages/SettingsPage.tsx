import { useAuthStore } from '../stores/useAuthStore';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="mx-auto max-w-2xl px-3 py-4 md:px-4 md:py-5">
      <h1 className="page-title mb-6">Profile Settings</h1>
      <div className="surface-panel space-y-4 p-6">
        <div>
          <p className="text-sm text-[#8f7365]">Name</p>
          <p className="font-medium text-slate-900">{user?.name}</p>
        </div>
        <div>
          <p className="text-sm text-[#8f7365]">Email</p>
          <p className="font-medium text-slate-900">{user?.email}</p>
        </div>
        <div>
          <p className="text-sm text-[#8f7365]">Role</p>
          <p className="font-medium capitalize text-slate-900">{user?.role}</p>
        </div>
        <hr className="border-[#efd6ca]" />
        <button
          onClick={logout}
          className="text-sm font-semibold text-[#b84f2b] transition-colors hover:text-[#9f4021]"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
