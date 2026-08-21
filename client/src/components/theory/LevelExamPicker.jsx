import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import LevelExamRound from './LevelExamRound';

const LANGUAGE_TABS = [
  { value: 'kz', label: 'Казахский' },
  { value: 'en', label: 'English' }
];

export default function LevelExamPicker() {
  const [language, setLanguage] = useState('kz');
  const [levels, setLevels] = useState(null);
  const [error, setError] = useState('');
  const [activeLevel, setActiveLevel] = useState(null);

  function load() {
    setLevels(null);
    api.getExamLevels(language).then(setLevels).catch((e) => setError(e.message));
  }

  useEffect(load, [language]);

  if (activeLevel) {
    return (
      <LevelExamRound
        language={language}
        level={activeLevel}
        onExit={() => {
          setActiveLevel(null);
          load();
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {LANGUAGE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setLanguage(tab.value)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              language === tab.value
                ? 'bg-indigo-600 text-white'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-neutral-500">
        Экзамен: до 50 случайных вопросов из накопленного пула по темам этого уровня. Нужно ответить правильно на все —
        частичный зачёт не считается. Пул растёт по мере добавления новых тем.
      </p>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {!levels && !error && <p className="text-sm text-neutral-400">Загрузка…</p>}

      <div className="space-y-2">
        {levels?.map((l) => (
          <div
            key={l.level}
            className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{l.level}</span>
                {l.passed && <span className="text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5">сдано</span>}
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">
                {l.exam_size} вопрос{l.exam_size === 1 ? '' : l.exam_size < 5 ? 'а' : 'ов'} в экзамене (из пула {l.pool_size})
                {l.attempts > 0 && ` · попыток: ${l.attempts}`}
              </div>
            </div>
            <button
              onClick={() => setActiveLevel(l.level)}
              className="shrink-0 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-medium"
            >
              {l.passed ? 'Пересдать' : 'Сдать'}
            </button>
          </div>
        ))}
        {levels?.length === 0 && <p className="text-sm text-neutral-500">Для этого языка пока нет тем с дриллами.</p>}
      </div>
    </div>
  );
}
