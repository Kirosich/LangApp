import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useStudySession } from '../hooks/useStudySession';
import { celebrateBadge } from '../utils/confetti';

const SECTION_ORDER = ['vocabulary', 'grammar'];
const SECTION_LABEL = { vocabulary: 'Словарь', grammar: 'Грамматика' };
const VERDICT_STYLE = {
  прочно: 'text-emerald-400',
  шатко: 'text-amber-400',
  'не дотягивает': 'text-red-400'
};

export default function ProficiencyTestRound() {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [error, setError] = useState('');

  function load() {
    api.getProficiencyTest(id).then(setTest).catch((e) => setError(e.message));
  }

  useEffect(load, [id]);

  if (error) return <div className="p-4 text-red-400">{error}</div>;
  if (!test) return <div className="p-4 text-neutral-400">Загрузка…</div>;

  return <ProficiencyTestBody key={id} test={test} onReload={load} />;
}

function ProficiencyTestBody({ test, onReload }) {
  const navigate = useNavigate();
  const alreadyDone = new Set(test.sections.map((s) => s.section_type));
  // Sections with an empty pool never get a DB row (nothing to score),
  // so the server can't tell us to skip them next time -- track that
  // locally for the rest of this attempt instead.
  const [locallySkipped, setLocallySkipped] = useState(new Set());
  const nextSection = SECTION_ORDER.find((s) => !alreadyDone.has(s) && !locallySkipped.has(s));

  const { endNow } = useStudySession('proficiency_test', test.language);

  const [sectionState, setSectionState] = useState('loading'); // loading | active | empty
  const [questions, setQuestions] = useState(null);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [answers, setAnswers] = useState([]);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (test.completed_at) return;
    if (!nextSection) {
      finishTest();
      return;
    }
    setSectionState('loading');
    setQuestions(null);
    setIndex(0);
    setValue('');
    setAnswers([]);

    const fetcher = nextSection === 'vocabulary' ? api.getProficiencyVocabQuestions : api.getProficiencyGrammarQuestions;
    fetcher(test.id)
      .then((data) => {
        setQuestions(data.questions);
        setSectionState('active');
      })
      .catch(() => setSectionState('empty'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test.id, nextSection]);

  async function finishTest() {
    setFinishing(true);
    try {
      const res = await api.completeProficiencyTest(test.id);
      await endNow();
      if (res.overall_verdict === 'прочно') celebrateBadge();
      onReload();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setFinishing(false);
    }
  }

  async function submitVocabAnswer() {
    const q = questions[index];
    const response = q.type === 'choice' ? value : value.trim();
    const updated = [...answers, { card_id: q.card_id, type: q.type, response }];
    setAnswers(updated);
    setValue('');

    if (index + 1 >= questions.length) {
      await api.submitProficiencyVocab(test.id, updated);
      onReload();
      return;
    }
    setIndex((i) => i + 1);
  }

  async function submitGrammarAnswer(selected) {
    const q = questions[index];
    const updated = [...answers, { drill_id: q.drill_id, response: selected }];
    setAnswers(updated);

    if (index + 1 >= questions.length) {
      await api.submitProficiencyGrammar(test.id, updated);
      onReload();
      return;
    }
    setIndex((i) => i + 1);
  }

  if (test.completed_at) {
    return <TestSummary test={test} onExit={() => navigate('/proficiency-test')} />;
  }

  if (finishing || sectionState === 'loading') {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <p className="text-sm text-neutral-400">Загрузка…</p>
      </div>
    );
  }

  if (sectionState === 'empty') {
    // No pool for this section at this level yet -- record nothing,
    // just move on to whatever's next (or finish).
    return (
      <div className="p-4 max-w-lg mx-auto space-y-3">
        <p className="text-sm text-neutral-500">
          Раздел «{SECTION_LABEL[nextSection]}» пока недоступен — нет материала для {test.target_level}.
        </p>
        <button
          onClick={() => setLocallySkipped((prev) => new Set(prev).add(nextSection))}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm"
        >
          Дальше
        </button>
      </div>
    );
  }

  const progressPercent = Math.round((index / questions.length) * 100);
  const question = questions[index];

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div>
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
          <span>{SECTION_LABEL[nextSection]}</span>
          <span>
            {index + 1} / {questions.length}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {nextSection === 'vocabulary' ? (
        <VocabQuestion question={question} value={value} setValue={setValue} onSubmit={submitVocabAnswer} />
      ) : (
        <GrammarQuestion question={question} onSubmit={submitGrammarAnswer} />
      )}
    </div>
  );
}

function VocabQuestion({ question, value, setValue, onSubmit }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-center">
        <div className="text-xs text-neutral-500 mb-1">Переведите на русский</div>
        <div className="text-xl font-semibold">{question.term}</div>
      </div>

      {question.type === 'choice' ? (
        <div className="grid grid-cols-1 gap-2">
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => {
                setValue(option);
                setTimeout(onSubmit, 0);
              }}
              className="rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-4 py-3 text-left transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) onSubmit();
          }}
          className="flex flex-col gap-3"
        >
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ваш ответ…"
            className="w-full rounded-xl border border-neutral-800 px-4 py-3 bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 font-medium">
            Дальше
          </button>
        </form>
      )}
    </div>
  );
}

function GrammarQuestion({ question, onSubmit }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-center">{question.prompt}</div>
      <div className="grid grid-cols-1 gap-2">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => onSubmit(option)}
            className="rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-4 py-3 text-left transition-colors"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function TestSummary({ test, onExit }) {
  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-center space-y-2">
        <div className="text-xs text-neutral-500">
          {test.language === 'kz' ? 'Казахский' : 'English'} · {test.target_level}
        </div>
        <div className={`text-2xl font-semibold ${VERDICT_STYLE[test.overall_verdict] || ''}`}>
          {test.overall_verdict || 'Недостаточно данных'}
        </div>
      </div>

      <div className="space-y-2">
        {test.sections.map((s) => (
          <div key={s.section_type} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-3">
            <span className="text-sm">{SECTION_LABEL[s.section_type] || s.section_type}</span>
            <span className="text-sm font-medium">{s.skipped ? 'пропущено' : `${s.score_percent}%`}</span>
          </div>
        ))}
      </div>

      <button onClick={onExit} className="w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 py-3 text-sm font-medium">
        К списку тестов
      </button>
    </div>
  );
}
