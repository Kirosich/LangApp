import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const LANGUAGE_LABEL = { kz: 'KZ', en: 'EN' };

export default function Browse() {
  const [cards, setCards] = useState([]);
  const [themes, setThemes] = useState([]);
  const [theme, setTheme] = useState('');
  const [language, setLanguage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats().then((s) => setThemes(s.by_theme.map((t) => t.theme))).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .getCards({ theme, language })
      .then(setCards)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [theme, language]);

  async function handleDelete(id) {
    if (!window.confirm('Удалить карточку?')) return;
    try {
      await api.deleteCard(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Все карточки</h1>
        <Link to="/cards/new" className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-sm">
          + Добавить
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm"
        >
          <option value="">Все языки</option>
          <option value="kz">Казахский</option>
          <option value="en">English</option>
        </select>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm"
        >
          <option value="">Все темы</option>
          {themes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-400 mb-2">{error}</p>}
      {loading && <p className="text-sm text-neutral-400">Загрузка…</p>}

      {/* Mobile: stacked cards */}
      <div className="sm:hidden space-y-2">
        {cards.map((card) => (
          <div key={card.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-neutral-500">
                {LANGUAGE_LABEL[card.language]} · {card.theme}
              </span>
              <span className="text-xs text-neutral-600">{card.progress.due_date}</span>
            </div>
            <div className="font-medium">{card.term}</div>
            <div className="text-neutral-400 text-sm">{card.translation_ru}</div>
            <div className="flex gap-3 mt-2 text-sm">
              <Link to={`/cards/${card.id}/edit`} className="text-indigo-400 hover:text-indigo-300">
                Изменить
              </Link>
              <button onClick={() => handleDelete(card.id)} className="text-red-400 hover:text-red-300">
                Удалить
              </button>
            </div>
          </div>
        ))}
        {!loading && cards.length === 0 && (
          <div className="p-6 text-center text-neutral-500 text-sm rounded-xl border border-neutral-800">
            Карточек не найдено
          </div>
        )}
      </div>

      {/* Desktop/tablet: table */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-neutral-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-900 text-neutral-400 text-left">
              <th className="px-3 py-2">Язык</th>
              <th className="px-3 py-2">Термин</th>
              <th className="px-3 py-2">Перевод</th>
              <th className="px-3 py-2">Тема</th>
              <th className="px-3 py-2">Повтор</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr key={card.id} className="border-t border-neutral-800 hover:bg-neutral-900/50">
                <td className="px-3 py-2 text-neutral-400">{LANGUAGE_LABEL[card.language]}</td>
                <td className="px-3 py-2">{card.term}</td>
                <td className="px-3 py-2">{card.translation_ru}</td>
                <td className="px-3 py-2 text-neutral-400">{card.theme}</td>
                <td className="px-3 py-2 text-neutral-500">{card.progress.due_date}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <Link to={`/cards/${card.id}/edit`} className="text-indigo-400 hover:text-indigo-300 mr-3">
                    Изменить
                  </Link>
                  <button onClick={() => handleDelete(card.id)} className="text-red-400 hover:text-red-300">
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && cards.length === 0 && (
          <div className="p-6 text-center text-neutral-500 text-sm">Карточек не найдено</div>
        )}
      </div>
    </div>
  );
}
