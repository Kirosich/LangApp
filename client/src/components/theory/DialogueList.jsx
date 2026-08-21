import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

export default function DialogueList() {
  const { language } = useLanguage();
  const [dialogues, setDialogues] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setDialogues(null);
    api.getDialogues(language).then(setDialogues).catch((e) => setError(e.message));
  }, [language]);

  return (
    <div className="space-y-3">
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
