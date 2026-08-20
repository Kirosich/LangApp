import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function Theory() {
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  function load() {
    api.getTheoryCourses().then(setCourses).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function addCourse(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await api.createTheoryCourse({ title: newTitle.trim() });
      setNewTitle('');
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setAdding(false);
    }
  }

  if (error) return <div className="p-4 text-red-400">{error}</div>;
  if (!courses) return <div className="p-4 text-neutral-400">Загрузка…</div>;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <h1 className="text-lg font-semibold">Теория</h1>

      <div className="space-y-2">
        {courses.map((course) => {
          const pct = course.items_total > 0 ? Math.round((course.items_done / course.items_total) * 100) : 0;
          return (
            <Link
              key={course.id}
              to={`/theory/courses/${course.id}`}
              className="block rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 p-4 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{course.title}</span>
                <span className="text-xs text-neutral-500">
                  {course.items_done}/{course.items_total}
                </span>
              </div>
              {course.description && <p className="text-xs text-neutral-500 mb-2">{course.description}</p>}
              <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
              </div>
            </Link>
          );
        })}
        {courses.length === 0 && <p className="text-sm text-neutral-500">Курсов пока нет.</p>}
      </div>

      <form onSubmit={addCourse} className="flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Новый курс…"
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
