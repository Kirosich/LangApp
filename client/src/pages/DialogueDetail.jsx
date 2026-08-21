import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { celebrateLevelUp } from '../utils/confetti';
import SpeakButton from '../components/SpeakButton';

export default function DialogueDetail() {
  const { slug } = useParams();
  const [dialogue, setDialogue] = useState(null);
  const [error, setError] = useState('');
  const [marking, setMarking] = useState(false);

  function load() {
    api.getDialogue(slug).then(setDialogue).catch((e) => setError(e.message));
  }

  useEffect(load, [slug]);

  async function markRead() {
    setMarking(true);
    try {
      const result = await api.markDialogueRead(slug);
      if (result.leveled_up) celebrateLevelUp();
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setMarking(false);
    }
  }

  if (error) return <div className="p-4 text-red-400">{error}</div>;
  if (!dialogue) return <div className="p-4 text-neutral-400">Загрузка…</div>;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <Link to="/theory" className="text-sm text-neutral-500 hover:text-neutral-300">
        ← К справочнику
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            {dialogue.scenario} · {dialogue.level}
          </span>
          {dialogue.read && <span className="text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5">прочитано</span>}
        </div>
        <h1 className="text-xl font-semibold">{dialogue.title}</h1>
      </div>

      <div className="space-y-2">
        {dialogue.lines.map((line, i) => (
          <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
            <div className="text-xs text-neutral-500 mb-1">{line.speaker}</div>
            <div className="flex items-center gap-2">
              <div className="font-medium">{line.text}</div>
              <SpeakButton text={line.text} language={dialogue.language} />
            </div>
            <div className="text-sm text-neutral-400 mt-0.5">{line.translation_ru}</div>
          </div>
        ))}
      </div>

      {dialogue.new_words.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Новые слова в этом диалоге</div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 space-y-1">
            {dialogue.new_words.map((w) => (
              <div key={w.term} className="flex justify-between text-sm">
                <span>{w.term}</span>
                <span className="text-neutral-500">{w.translation_ru}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={markRead}
        disabled={marking}
        className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 font-medium"
      >
        {dialogue.read ? 'Понятно, прочитать ещё раз ✓' : 'Понятно, отметить как изученное'}
      </button>
    </div>
  );
}
