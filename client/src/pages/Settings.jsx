import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const LANGUAGE_LABEL = { kz: 'Казахский', en: 'English' };

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  function load() {
    api.getBacklogSettings().then(setSettings).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function save(language, value) {
    const newCardsPerDay = Math.max(0, parseInt(value, 10) || 0);
    setSaved('');
    try {
      await api.updateBacklogSettings(language, newCardsPerDay);
      setSaved(language);
      setTimeout(() => setSaved(''), 1500);
    } catch (e) {
      setError(e.message);
    }
  }

  if (error) return <div className="p-4 text-red-400">{error}</div>;
  if (!settings) return <div className="p-4 text-neutral-400">Загрузка…</div>;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-300">
        ← На дашборд
      </Link>
      <h1 className="text-lg font-semibold">Настройки</h1>

      <div className="space-y-3">
        <h2 className="text-sm text-neutral-400">Новых карточек в день (из склада)</h2>
        {settings.map((row) => (
          <div key={row.language} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-3">
            <span className="text-sm">{LANGUAGE_LABEL[row.language]}</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                defaultValue={row.new_cards_per_day}
                onBlur={(e) => save(row.language, e.target.value)}
                className="w-20 rounded-lg bg-neutral-950 border border-neutral-800 px-2 py-1 text-sm text-right"
              />
              {saved === row.language && <span className="text-xs text-emerald-400">сохранено</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
