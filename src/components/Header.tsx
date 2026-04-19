'use client';

import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-gradient-to-r from-[#5b21b6] via-[#7c3aed] to-[#a78bfa] text-white py-4 px-4 shadow-[0_4px_20px_rgba(124,58,237,0.3)]">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-widest leading-tight">FORJA</h1>
            {user && (
              <p className="text-[10px] text-white/60 font-medium tracking-wide">
                {user.nombre}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="px-2.5 py-1 rounded-lg bg-white/20 text-xs font-medium hover:bg-white/30 transition-colors"
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user?.rol === 'admin' && (
            <button
              onClick={() => router.push('/admin')}
              className="px-2.5 py-1 rounded-lg bg-white/20 text-xs font-medium hover:bg-white/30 transition-colors"
            >
              🛡️ Admin
            </button>
          )}
          <button
            onClick={handleLogout}
            className="px-2.5 py-1 rounded-lg bg-white/20 text-xs font-medium hover:bg-white/30 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
