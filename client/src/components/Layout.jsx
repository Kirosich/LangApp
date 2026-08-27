import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const LANGUAGE_OPTIONS = [
  { value: 'kz', label: 'Казахский' },
  { value: 'en', label: 'English' }
];

const NAV_ITEMS = [
  { to: '/', label: 'Дашборд', icon: '🏠', end: true },
  { to: '/study', label: 'Учить', icon: '📚' },
  { to: '/quiz', label: 'Упражнения', icon: '🎯' },
  { to: '/browse', label: 'Карточки', icon: '🗂️' },
  { to: '/theory', label: 'Теория', icon: '📖' },
  { to: '/media', label: 'Фильмы', icon: '🎬' },
  { to: '/known', label: 'Знания', icon: '🏅' }
];

function navLinkClass({ isActive }) {
  return `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs transition-colors ${
    isActive ? 'text-indigo-400' : 'text-neutral-500 hover:text-neutral-300'
  }`;
}

export default function Layout() {
  const { logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const online = useOnlineStatus();

  return (
    <div className="h-dvh flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden">
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur z-10">
        <span className="font-semibold">Langapp</span>
        <button onClick={logout} className="text-sm text-neutral-500 hover:text-neutral-300">
          Выйти
        </button>
      </header>

      <div className="shrink-0 px-4 py-2 border-b border-neutral-800 bg-neutral-950/95">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full rounded-lg px-3 py-1.5 text-sm font-medium bg-neutral-900 text-white border border-neutral-800"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {!online && (
        <div className="shrink-0 bg-amber-500/15 text-amber-400 text-xs text-center py-1.5 px-4">
          Нет сети — показываю то, что сохранено на устройстве
        </div>
      )}

      <main className="flex-1 overflow-y-auto overscroll-contain">
        <Outlet />
      </main>

      <nav
        className="shrink-0 flex bg-neutral-900 border-t border-neutral-800"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
