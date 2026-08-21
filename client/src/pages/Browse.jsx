import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useTheoryThemeLinks } from '../hooks/useTheoryThemeLinks';
import SpeakButton from '../components/SpeakButton';

const LANGUAGE_LABEL = { kz: 'KZ', en: 'EN' };
const STATUS_OPTIONS = [
  { value: '', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'backlog', label: 'На складе' },
  { value: 'mastered', label: 'Уже знаю' }
];

function TheoryLink({ link }) {
  if (!link) return null;
  return (
    <Link to={`/theory/topics/${link.topic_slug}`} title={link.topic_title} className="ml-1 text-indigo-400 hover:text-indigo-300">
      Теория
    </Link>
  );
}

export default function Browse() {
  const { language } = useLanguage();
  const [cards, setCards] = useState([]);
  const [themes, setThemes] = useState([]);
  const [theme, setTheme] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const themeLinks = useTheoryThemeLinks();

  useEffect(() => {
    setTheme('');
    api.getStats({ language }).then((s) => setThemes(s.by_theme.map((t) => t.theme))).catch(() => {});
  }, [language]);

  function load() {
    setLoading(true);
    api
      .getCards({ theme, language, status })
      .then(setCards)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [theme, language, status]);

  async function handleDelete(id) {
    if (!window.confirm('Удалить карточку?')) return;
    try {
      await api.deleteCard(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleMaster(id) {
    try {
      await api.masterCard(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleUnmaster(id) {
    try {
      await api.unmasterCard(id);
      load();
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

      <div className="flex flex-wrap gap-2 mb-4">
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
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-400 mb-2">{error}</p>}
      {loading && <p className="text-sm text-neutral-400">Загрузка…</p>}

      {/* Mobile: stacked cards */}
      <div className="sm:hidden space-y-2">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`rounded-xl border p-3 ${
              card.mastered_at ? 'border-neutral-800/60 bg-neutral-900/50 opacity-70' : 'border-neutral-800 bg-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-neutral-500">
                {LANGUAGE_LABEL[card.language]} · {card.theme}
                {card.status === 'backlog' && !card.mastered_at && (
                  <span className="ml-1 text-amber-500">· склад</span>
                )}
                <TheoryLink link={themeLinks[`${card.language}::${card.theme}`]} />
              </span>
              <span className="text-xs text-neutral-600">{card.progress?.due_date ?? '—'}</span>
            </div>
            <div className="font-medium flex items-center gap-1">
              {card.mastered_at && <span className="text-emerald-400">✓</span>}
              {card.term}
              <SpeakButton text={card.term} language={card.language} />
            </div>
            <div className="text-neutral-400 text-sm">{card.translation_ru}</div>
            <div className="flex gap-3 mt-2 text-sm items-center">
              <Link to={`/cards/${card.id}/edit`} className="text-indigo-400 hover:text-indigo-300">
                Изменить
              </Link>
              <button onClick={() => handleDelete(card.id)} className="text-red-400 hover:text-red-300">
                Удалить
              </button>
              {card.mastered_at ? (
                <button onClick={() => handleUnmaster(card.id)} className="text-neutral-500 hover:text-neutral-300 ml-auto">
                  ↩ вернуть
                </button>
              ) : (
                <button onClick={() => handleMaster(card.id)} className="text-emerald-500 hover:text-emerald-400 ml-auto">
                  ✓ Уже знаю
                </button>
              )}
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
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2">Повтор</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr
                key={card.id}
                className={`border-t border-neutral-800 hover:bg-neutral-900/50 ${card.mastered_at ? 'opacity-60' : ''}`}
              >
                <td className="px-3 py-2 text-neutral-400">{LANGUAGE_LABEL[card.language]}</td>
                <td className="px-3 py-2">
                  {card.mastered_at && <span className="text-emerald-400 mr-1">✓</span>}
                  {card.term}
                  <SpeakButton text={card.term} language={card.language} className="ml-1" />
                </td>
                <td className="px-3 py-2">{card.translation_ru}</td>
                <td className="px-3 py-2 text-neutral-400">
                  {card.theme}
                  <TheoryLink link={themeLinks[`${card.language}::${card.theme}`]} />
                </td>
                <td className="px-3 py-2 text-neutral-500">
                  {card.mastered_at ? 'уже знаю' : card.status === 'backlog' ? 'склад' : 'активна'}
                </td>
                <td className="px-3 py-2 text-neutral-500">{card.progress?.due_date ?? '—'}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <Link to={`/cards/${card.id}/edit`} className="text-indigo-400 hover:text-indigo-300 mr-3">
                    Изменить
                  </Link>
                  <button onClick={() => handleDelete(card.id)} className="text-red-400 hover:text-red-300 mr-3">
                    Удалить
                  </button>
                  {card.mastered_at ? (
                    <button onClick={() => handleUnmaster(card.id)} className="text-neutral-500 hover:text-neutral-300">
                      ↩ вернуть
                    </button>
                  ) : (
                    <button onClick={() => handleMaster(card.id)} className="text-emerald-500 hover:text-emerald-400">
                      ✓ Уже знаю
                    </button>
                  )}
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
