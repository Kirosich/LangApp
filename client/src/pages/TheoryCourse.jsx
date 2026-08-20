import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';

const STATUS_LABEL = { not_started: 'не начато', in_progress: 'в процессе', done: 'готово' };
const STATUS_CLASS = {
  not_started: 'bg-neutral-800 text-neutral-400',
  in_progress: 'bg-amber-500/20 text-amber-400',
  done: 'bg-emerald-500/20 text-emerald-400'
};

function formatMinutes(minutes) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} ч ${m ? `${m} мин` : ''}`.trim() : `${m} мин`;
}

export default function TheoryCourse() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  function load() {
    api.getTheoryCourse(id).then(setCourse).catch((e) => setError(e.message));
  }

  useEffect(load, [id]);

  async function addBlock(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await api.createTheoryBlock(id, { title: newTitle.trim() });
      setNewTitle('');
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setAdding(false);
    }
  }

  if (error) return <div className="p-4 text-red-400">{error}</div>;
  if (!course) return <div className="p-4 text-neutral-400">Загрузка…</div>;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <Link to="/theory" className="text-sm text-neutral-500 hover:text-neutral-300">
        ← Все курсы
      </Link>
      <h1 className="text-lg font-semibold">{course.title}</h1>
      {course.description && <p className="text-sm text-neutral-500">{course.description}</p>}

      <div className="space-y-2">
        {course.blocks.map((block) => {
          const minutesLabel =
            block.planned_minutes || block.logged_minutes
              ? `${formatMinutes(block.logged_minutes) || '0 мин'}${
                  block.planned_minutes ? ` / ${formatMinutes(block.planned_minutes)}` : ''
                }`
              : null;
          return (
            <Link
              key={block.id}
              to={`/theory/blocks/${block.id}`}
              className="block rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 p-4 transition-colors"
            >
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="font-medium">{block.title}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${STATUS_CLASS[block.status]}`}>
                  {STATUS_LABEL[block.status]}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>
                  {block.items_done}/{block.items_total} пунктов
                </span>
                {minutesLabel && <span>{minutesLabel}</span>}
              </div>
            </Link>
          );
        })}
        {course.blocks.length === 0 && <p className="text-sm text-neutral-500">Блоков пока нет.</p>}
      </div>

      <form onSubmit={addBlock} className="flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Новый блок…"
          className="flex-1 rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={adding}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 text-sm font-medium"
        >
          +
        </button>
      </form>
    </div>
  );
}
