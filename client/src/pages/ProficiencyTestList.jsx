import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const LANGUAGE_LABEL = { kz: 'Казахский', en: 'English' };
const VERDICT_STYLE = {
  прочно: 'text-emerald-400 bg-emerald-500/20',
  шатко: 'text-amber-400 bg-amber-500/20',
  'не дотягивает': 'text-red-400 bg-red-500/20'
};

export default function ProficiencyTestList() {
  const navigate = useNavigate();
  const [tests, setTests] = useState(null);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(null);

  function load() {
    api.getProficiencyTests().then(setTests).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function start(def) {
    setStarting(`${def.language}-${def.target_level}`);
    try {
      const { id } = await api.startProficiencyTest(def.language, def.target_level);
      navigate(`/proficiency-test/${id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setStarting(null);
    }
  }

  if (error) return <div className="p-4 text-red-400">{error}</div>;
  if (!tests) return <div className="p-4 text-neutral-400">Загрузка…</div>;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-300">
        ← На дашборд
      </Link>
      <div>
        <h1 className="text-lg font-semibold">Тест на уровень</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Комплексная диагностика: словарь + грамматика (аудирование и письмо — позже). Отдельно от «Экзамена» в Теории —
          там узкая грамматическая сертификация на 100%, здесь профиль по секциям.
        </p>
      </div>

      <div className="space-y-2">
        {tests.map((def) => {
          const key = `${def.language}-${def.target_level}`;
          const noPool = def.vocab_pool_size === 0 && def.grammar_pool_size === 0;
          return (
            <div key={key} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-medium">
                  {LANGUAGE_LABEL[def.language]} · {def.target_level}
                </span>
                {def.last_result?.overall_verdict && (
                  <span className={`text-[10px] rounded-full px-2 py-0.5 ${VERDICT_STYLE[def.last_result.overall_verdict] || ''}`}>
                    {def.last_result.overall_verdict}
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-500 mb-3">
                словарь: {def.vocab_pool_size} слов · грамматика: {def.grammar_pool_size} вопросов
                {def.vocab_pool_size < 10 && def.vocab_pool_size > 0 && ' (маловато для точной картины)'}
              </div>
              {noPool ? (
                <p className="text-xs text-neutral-600">Пока нет материала для этого уровня.</p>
              ) : def.in_progress_test_id ? (
                <Link
                  to={`/proficiency-test/${def.in_progress_test_id}`}
                  className="block text-center rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-medium"
                >
                  Продолжить
                </Link>
              ) : (
                <button
                  onClick={() => start(def)}
                  disabled={starting === key}
                  className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-3 py-2 text-sm font-medium"
                >
                  {starting === key ? 'Начинаю…' : def.last_result ? 'Пройти заново' : 'Начать'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
