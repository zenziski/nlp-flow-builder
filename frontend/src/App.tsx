import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './stores/useAuthStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BotsPage from './pages/BotsPage';
import BuilderPage from './pages/BuilderPage';
import SettingsPage from './pages/SettingsPage';
import NlpPage from './pages/NlpPage';
import BotConfigPage from './pages/BotConfigPage';
import UsagePage from './pages/UsagePage';
import ConversationsPage from './pages/ConversationsPage';
import AppLayout from './components/layout/AppLayout';
import VaultPage from './pages/VaultPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <>
    <Toaster position="bottom-right" richColors closeButton />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="bots" element={<BotsPage />} />
          <Route path="bots/:botId/nlp" element={<NlpPage />} />
          <Route path="bots/:botId/config" element={<BotConfigPage />} />
          <Route path="analytics" element={<UsagePage />} />
          <Route path="conversations" element={<ConversationsPage />} />
          <Route path="vault" element={<VaultPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route
          path="/builder/:botId/:flowId"
          element={
            <ProtectedRoute>
              <BuilderPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
    </>  
  );
}
