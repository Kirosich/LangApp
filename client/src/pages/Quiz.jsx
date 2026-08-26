import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, endSessionOnUnload } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import ChoiceQuiz from '../components/quiz/ChoiceQuiz';
import TypingQuiz from '../components/quiz/TypingQuiz';
import MatchingQuiz from '../components/quiz/MatchingQuiz';
import SentenceQuiz from '../components/quiz/SentenceQuiz';
import ListeningQuiz from '../components/quiz/ListeningQuiz';
import { celebrateBadge } from '../utils/confetti';

const TYPE_OPTIONS = [
  { value: 'choice', label: 'Выбор варианта' },
  { value: 'typing', label: 'Ввод с клавиатуры' },
  { value: 'matching', label: 'Сопоставление пар' },
  { value: 'sentence', label: 'Собери предложение' },
  { value: 'listening', label: 'Аудирование (на слух)' }
];

const SESSION_TYPE_FOR_QUIZ = {
  choice: 'quiz_choice',
  typing: 'quiz_typing',
  matching: 'quiz_matching',
  sentence: 'quiz_sentence',
  listening: 'quiz_listening'
};

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();

  const [stage, setStage] = useState('settings'); // settings | playing | result
  const [themes, setThemes] = useState([]);
  const [type, setType] = useState(searchParams.get('type') || 'choice');
  const [theme, setTheme] = useState('');
  const [count, setCount] = useState(10);
  const [includeMastered, setIncludeMastered] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sessionIdRef = useRef(null);
  const cardsReviewedRef = useRef(0);
  const correctCountRef = useRef(0);
  const sessionEndedRef = useRef(true);

  useEffect(() => {
    setTheme('');
    api.getStats({ language }).then((s) => setThemes(s.by_theme.map((t) => t.theme))).catch(() => {});
  }, [language]);

  function endActiveSession() {
    if (sessionEndedRef.current || !sessionIdRef.current) return null;
    sessionEndedRef.current = true;
    return api.endSession(sessionIdRef.current, cardsReviewedRef.current, correctCountRef.current).catch(() => null);
  }

  useEffect(() => {
    function handlePageHide() {
      if (!sessionEndedRef.current && sessionIdRef.current) {
        endSessionOnUnload(sessionIdRef.current, cardsReviewedRef.current, correctCountRef.current);
      }
    }
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      endActiveSession();
    };
  }, []);

  async function start(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.getQuiz({ type, theme, language, count, includeMastered: includeMastered ? 'true' : '' });
      setQuizData(data);
      setStage('playing');

      cardsReviewedRef.current = 0;
      correctCountRef.current = 0;
      sessionEndedRef.current = false;
      const session = await api.startSession(SESSION_TYPE_FOR_QUIZ[type], language);
      sessionIdRef.current = session.id;
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function progress(isCorrect) {
    cardsReviewedRef.current += 1;
    if (isCorrect) correctCountRef.current += 1;
  }

  function finish(score, total) {
    endActiveSession()?.then((result) => {
      if (result?.newly_earned_badges?.length) celebrateBadge();
    });
    setResult({ score, total });
    setStage('result');
  }

  function restart() {
    setStage('settings');
    setQuizData(null);
    setResult(null);
  }

  if (stage === 'result') {
    const total = result.total ?? (quizData.type === 'matching' ? quizData.rounds.flat().length : quizData.questions.length);
    return (
      <div className="p-4 max-w-lg mx-auto text-center flex flex-col items-center gap-3 mt-16">
        <div className="text-2xl font-semibold">Результат</div>
        <div className="text-4xl font-bold text-indigo-400">
          {result.score} / {total}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={restart} className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-4 py-2 text-sm">
            Новый квиз
          </button>
          <Link to="/" className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-4 py-2 text-sm">
            На дашборд
          </Link>
        </div>
      </div>
    );
  }

  if (stage === 'playing') {
    if (quizData.type === 'choice' && quizData.questions.length > 0) {
      return (
        <div className="p-4 max-w-lg mx-auto">
          <ChoiceQuiz questions={quizData.questions} onFinish={finish} onProgress={progress} />
        </div>
      );
    }
    if (quizData.type === 'typing' && quizData.questions.length > 0) {
      return (
        <div className="p-4 max-w-lg mx-auto">
          <TypingQuiz questions={quizData.questions} onFinish={finish} onProgress={progress} />
        </div>
      );
    }
    if (quizData.type === 'matching' && quizData.rounds.length > 0) {
      return (
        <div className="p-4 max-w-lg mx-auto">
          <MatchingQuiz rounds={quizData.rounds} onFinish={finish} onProgress={progress} />
        </div>
      );
    }
    if (quizData.type === 'sentence' && quizData.questions.length > 0) {
      return (
        <div className="p-4 max-w-lg mx-auto">
          <SentenceQuiz questions={quizData.questions} onFinish={finish} onProgress={progress} />
        </div>
      );
    }
    if (quizData.type === 'listening' && quizData.questions.length > 0) {
      return (
        <div className="p-4 max-w-lg mx-auto">
          <ListeningQuiz questions={quizData.questions} onFinish={finish} onProgress={progress} />
        </div>
      );
    }
    return (
      <div className="p-4 max-w-lg mx-auto text-center mt-16">
        <div className="text-neutral-400 mb-4">Недостаточно карточек для этого квиза.</div>
        <button onClick={restart} className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-4 py-2 text-sm">
          Назад
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-lg font-semibold mb-4">Настройки квиза</h1>
      <form onSubmit={start} className="space-y-4">
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Тип</label>
          <div className="grid grid-cols-1 gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setType(opt.value)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  type === opt.value ? 'border-indigo-500 bg-indigo-500/20' : 'border-neutral-800 bg-neutral-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-neutral-400 mb-1">Тема</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2"
          >
            <option value="">Все темы</option>
            {themes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-neutral-400 mb-1">Количество вопросов</label>
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-400">
          <input
            type="checkbox"
            checked={includeMastered}
            onChange={(e) => setIncludeMastered(e.target.checked)}
            className="rounded border-neutral-700 bg-neutral-900"
          />
          Включать слова, отмеченные «уже знаю»
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 font-medium"
        >
          {loading ? 'Загрузка…' : 'Начать квиз'}
        </button>
      </form>
    </div>
  );
}
