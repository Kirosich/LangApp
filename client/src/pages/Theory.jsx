import { useState } from 'react';
import TheoryPlan from '../components/theory/TheoryPlan';
import TheoryReferenceList from '../components/theory/TheoryReferenceList';

const VIEWS = [
  { value: 'reference', label: 'Справочник' },
  { value: 'plan', label: 'Мой план' }
];

export default function Theory() {
  const [view, setView] = useState('reference');

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <h1 className="text-lg font-semibold">Теория</h1>

      <div className="flex gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.value}
            onClick={() => setView(v.value)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              view === v.value
                ? 'bg-neutral-100 text-neutral-900'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === 'reference' ? <TheoryReferenceList /> : <TheoryPlan />}
    </div>
  );
}
