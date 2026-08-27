import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { isCloseEnough } from '../../utils/levenshtein';

export default function ParadigmTable({ language, paradigmType, onProgress, onFinish }) {
  const [paradigm, setParadigm] = useState(null);
  const [values, setValues] = useState({});
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const [roundsDone, setRoundsDone] = useState(0);
  const [cellsCorrect, setCellsCorrect] = useState(0);
  const [cellsTotal, setCellsTotal] = useState(0);

  function loadNew() {
    setChecked(false);
    setValues({});
    setError('');
    api.getRandomParadigm(language, paradigmType).then(setParadigm).catch((e) => setError(e.message));
  }

  useEffect(loadNew, [language, paradigmType]);

  function setValue(i, v) {
    setValues((prev) => ({ ...prev, [i]: v }));
  }

  function check(e) {
    e.preventDefault();
    if (checked || !paradigm) return;
    setChecked(true);
    let correctCount = 0;
    paradigm.cells.forEach((cell, i) => {
      if (isCloseEnough(values[i] || '', cell.answer, 1)) correctCount += 1;
    });
    setCellsCorrect((c) => c + correctCount);
    setCellsTotal((c) => c + paradigm.cells.length);
    setRoundsDone((r) => r + 1);
    onProgress?.(correctCount === paradigm.cells.length);
  }

  function next() {
    loadNew();
  }

  function finish() {
    onFinish(cellsCorrect, cellsTotal || 1);
  }

  if (error) return <div className="text-sm text-red-400">{error}</div>;
  if (!paradigm) return <div className="text-neutral-400 text-sm">Загрузка…</div>;

  return (
    <div className="space-y-4">
      <div className="text-sm text-neutral-500 text-center">
        Слово {roundsDone + 1} · верно {cellsCorrect}/{cellsTotal} ячеек
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-center">
        <div className="text-2xl font-semibold">{paradigm.word}</div>
        <div className="text-sm text-neutral-500 mt-1">{paradigm.gloss}</div>
      </div>

      <form onSubmit={check} className="space-y-2">
        {paradigm.cells.map((cell, i) => {
          const value = values[i] || '';
          const isCorrect = checked && isCloseEnough(value, cell.answer, 1);
          const isWrong = checked && !isCorrect;
          return (
            <div
              key={i}
              className={`rounded-lg border p-2.5 flex items-center gap-3 ${
                isCorrect ? 'border-emerald-500 bg-emerald-500/10' : isWrong ? 'border-red-500 bg-red-500/10' : 'border-neutral-800 bg-neutral-950'
              }`}
            >
              <div className="w-40 shrink-0 text-xs text-neutral-400">{cell.label}</div>
              <input
                value={value}
                onChange={(e) => setValue(i, e.target.value)}
                disabled={checked}
                className="flex-1 min-w-0 rounded-md bg-neutral-900 border border-neutral-800 px-2 py-1.5 text-sm disabled:opacity-80"
                autoCapitalize="off"
                autoCorrect="off"
              />
              {isWrong && <div className="shrink-0 text-xs text-emerald-400">{cell.answer}</div>}
              {isCorrect && <div className="shrink-0 text-emerald-400">✓</div>}
            </div>
          );
        })}

        {!checked ? (
          <button type="submit" className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 font-medium">
            Проверить
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={next}
              className="flex-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 py-3 font-medium"
            >
              Другое слово
            </button>
            <button
              type="button"
              onClick={finish}
              className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 font-medium"
            >
              Закончить
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
