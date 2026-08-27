import { Link } from 'react-router-dom';

const ITEMS = [
  { to: '/browse', label: 'Карточки', icon: '🗂️' },
  { to: '/media', label: 'Фильмы', icon: '🎬' },
  { to: '/known', label: 'Знания', icon: '🏅' },
  { to: '/settings', label: 'Настройки', icon: '⚙️' }
];

export default function More() {
  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-lg font-semibold mb-4">Ещё</h1>
      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 py-5 transition-colors"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm text-neutral-200">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
