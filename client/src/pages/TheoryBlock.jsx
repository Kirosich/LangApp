import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Не начато' },
  { value: 'in_progress', label: 'В процессе' },
  { value: 'done', label: 'Готово' }
];

export default function TheoryBlock() {
  const { id } = useParams();
  const [block, setBlock] = useState(null);
  const [error, setError] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [adding, setAdding] = useState(false);

  function load() {
    api.getTheoryBlock(id).then(setBlock).catch((e) => setError(e.message));
  }

  useEffect(load, [id]);

  async function setStatus(status) {
    try {
      await api.updateTheoryBlock(id, { status });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function saveLoggedMinutes(value) {
    const minutes = Math.max(0, parseInt(value, 10) || 0);
    try {
      await api.updateTheoryBlock(id, { logged_minutes: minutes });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggleItem(item) {
    try {
      await api.updateTheoryItem(item.id, { done: !item.done });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function saveItemNotes(item, notes) {
    try {
      await api.updateTheoryItem(item.id, { notes });
    } catch (e) {
      setError(e.message);
    }
  }

  async function deleteItem(itemId) {
    try {
      await api.deleteTheoryItem(itemId);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function addItem(e) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    setAdding(true);
    try {
      await api.createTheoryItem(id, { label: newLabel.trim() });
      setNewLabel('');
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setAdding(false);
    }
  }

  if (error) return <div className="p-4 text-red-400">{error}</div>;
  if (!block) return <div className="p-4 text-neutral-400">Загрузка…</div>;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <Link to="/theory" className="text-sm text-neutral-500 hover:text-neutral-300">
        ← К курсам
      </Link>
      <h1 className="text-lg font-semibold">{block.title}</h1>

      <div className="flex gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatus(opt.value)}
            className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
              block.status === opt.value
                ? 'bg-indigo-600 text-white'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {(block.planned_minutes || block.logged_minutes > 0) && (
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <span>Время:</span>
          <input
            type="number"
            min={0}
            defaultValue={block.logged_minutes}
            onBlur={(e) => saveLoggedMinutes(e.target.value)}
            className="w-20 rounded-lg bg-neutral-900 border border-neutral-800 px-2 py-1 text-sm text-neutral-200"
          />
          <span>мин{block.planned_minutes ? ` из ${block.planned_minutes} план.` : ''}</span>
        </div>
      )}

      <div className="space-y-2">
        {block.items.map((item) => (
          <div key={item.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={Boolean(item.done)}
                onChange={() => toggleItem(item)}
                className="mt-1 size-4 accent-indigo-600"
              />
              <div className="flex-1">
                <div className={item.done ? 'line-through text-neutral-500' : ''}>{item.label}</div>
                <textarea
                  defaultValue={item.notes || ''}
                  placeholder="Заметки / примеры…"
                  rows={1}
                  onBlur={(e) => saveItemNotes(item, e.target.value)}
                  className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-2 py-1 text-xs text-neutral-400 resize-y"
                />
              </div>
              <button onClick={() => deleteItem(item.id)} className="text-xs text-red-400 hover:text-red-300 shrink-0">
                ✕
              </button>
            </div>
          </div>
        ))}
        {block.items.length === 0 && <p className="text-sm text-neutral-500">Пунктов пока нет.</p>}
      </div>

      <form onSubmit={addItem} className="flex gap-2">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Новый пункт…"
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
