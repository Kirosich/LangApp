import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Дашборд', icon: '🏠', end: true },
  { to: '/study', label: 'Учить', icon: '📚' },
  { to: '/quiz', label: 'Квиз', icon: '🎯' },
  { to: '/browse', label: 'Карточки', icon: '🗂️' }
];

function navLinkClass({ isActive }) {
  return `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs transition-colors ${
    isActive ? 'text-indigo-400' : 'text-neutral-500 hover:text-neutral-300'
  }`;
}

export default function Layout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-svh flex flex-col bg-neutral-950 text-neutral-100">
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 sticky top-0 bg-neutral-950/95 backdrop-blur z-10">
        <span className="font-semibold">Langapp</span>
        <button onClick={logout} className="text-sm text-neutral-500 hover:text-neutral-300">
          Выйти
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 flex bg-neutral-900 border-t border-neutral-800 max-w-lg mx-auto left-0 right-0">
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
