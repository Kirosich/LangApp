import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import SpeakButton from '../components/SpeakButton';

export default function KnownWords() {
  const { language } = useLanguage();
  const [cards, setCards] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  function load() {
    api.getKnownCards(language).then(setCards).catch((e) => setError(e.message));
  }

  useEffect(() => {
    setCards(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  async function unmaster(id) {
    try {
      await api.unmasterCard(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  const filtered = useMemo(() => {
    if (!cards) return null;
    const q = search.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) => c.term.toLowerCase().includes(q) || c.translation_ru.toLowerCase().includes(q)
    );
  }, [cards, search]);

  const grouped = useMemo(() => {
    if (!filtered) return null;
    const map = new Map();
    for (const card of filtered) {
      if (!map.has(card.theme)) map.set(card.theme, []);
      map.get(card.theme).push(card);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Мои знания</h1>
        <span className="text-sm text-neutral-400">Всего: {cards?.length ?? '—'} слов</span>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск по слову или переводу…"
        className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm"
      />

      {error && <p className="text-sm text-red-400">{error}</p>}
      {!grouped && !error && <p className="text-sm text-neutral-400">Загрузка…</p>}

      {grouped && grouped.length === 0 && (
        <p className="text-sm text-neutral-500">
          {search ? 'Ничего не найдено.' : 'Пока пусто — слова появятся здесь по мере изучения.'}
        </p>
      )}

      <div className="space-y-4">
        {grouped?.map(([theme, themeCards]) => (
          <div key={theme}>
            <h2 className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
              {theme} · {themeCards.length}
            </h2>
            <div className="space-y-2">
              {themeCards.map((card) => (
                <div key={card.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium flex items-center gap-1">
                        {card.term}
                        <SpeakButton text={card.term} language={language} />
                      </div>
                      <div className="text-sm text-neutral-400">{card.translation_ru}</div>
                      {card.transcription && <div className="text-xs text-neutral-500 mt-0.5">{card.transcription}</div>}
                      {card.example_sentence && (
                        <div className="text-xs italic text-neutral-500 mt-1">{card.example_sentence}</div>
                      )}
                    </div>
                    <button
                      onClick={() => unmaster(card.id)}
                      title="Вернуть в обучение"
                      className="shrink-0 text-xs text-neutral-500 hover:text-red-400"
                    >
                      ↩ вернуть в обучение
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
