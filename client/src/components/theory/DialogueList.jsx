import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

const LANGUAGE_TABS = [
  { value: 'kz', label: 'Казахский' },
  { value: 'en', label: 'English' }
];

export default function DialogueList() {
  const [language, setLanguage] = useState('kz');
  const [dialogues, setDialogues] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setDialogues(null);
    api.getDialogues(language).then(setDialogues).catch((e) => setError(e.message));
  }, [language]);

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

      {error && <p className="text-sm text-red-400">{error}</p>}
      {!dialogues && !error && <p className="text-sm text-neutral-400">Загрузка…</p>}
      {dialogues?.length === 0 && <p className="text-sm text-neutral-500">Пока нет диалогов для этого языка.</p>}

      <div className="space-y-2">
        {dialogues?.map((d) => (
          <Link
            key={d.slug}
            to={`/theory/dialogues/${d.slug}`}
            className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 p-4"
          >
            <div>
              <div className="font-medium">{d.title}</div>
              <div className="text-xs text-neutral-500 mt-0.5">
                {d.scenario} · {d.level}
              </div>
            </div>
            {d.read && <span className="text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5">прочитано</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
