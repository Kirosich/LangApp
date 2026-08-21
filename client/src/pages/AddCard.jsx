import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_THEMES = ['еда', 'природа', 'числа/время', 'глаголы', 'бытовое'];

export default function AddCard() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [form, setForm] = useState({
    language,
    term: '',
    translation_ru: '',
    transcription: '',
    theme: '',
    example_sentence: ''
  });
  const [themes, setThemes] = useState(DEFAULT_THEMES);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .getStats()
      .then((s) => {
        const known = s.by_theme.map((t) => t.theme);
        setThemes([...new Set([...DEFAULT_THEMES, ...known])]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api
      .getCards()
      .then((cards) => {
        const card = cards.find((c) => c.id === Number(id));
        if (!card) {
          setError('Карточка не найдена');
          return;
        }
        setForm({
          language: card.language,
          term: card.term,
          translation_ru: card.translation_ru,
          transcription: card.transcription || '',
          theme: card.theme,
          example_sentence: card.example_sentence || ''
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      transcription: form.transcription || null,
      example_sentence: form.example_sentence || null
    };
    try {
      if (isEdit) {
        await api.updateCard(id, payload);
      } else {
        await api.createCard(payload);
      }
      navigate('/browse');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4 text-neutral-400">Загрузка…</div>;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-lg font-semibold mb-4">{isEdit ? 'Редактировать карточку' : 'Добавить карточку'}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Язык</label>
          <select
            value={form.language}
            onChange={(e) => update('language', e.target.value)}
            className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2"
          >
            <option value="kz">Казахский</option>
            <option value="en">English</option>
          </select>
        </div>

        <Field label="Термин" value={form.term} onChange={(v) => update('term', v)} required />
        <Field label="Перевод (рус.)" value={form.translation_ru} onChange={(v) => update('translation_ru', v)} required />
        <Field label="Транскрипция" value={form.transcription} onChange={(v) => update('transcription', v)} />

        <div>
          <label className="block text-sm text-neutral-400 mb-1">Тема</label>
          <input
            list="theme-options"
            value={form.theme}
            onChange={(e) => update('theme', e.target.value)}
            required
            className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2"
          />
          <datalist id="theme-options">
            {themes.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm text-neutral-400 mb-1">Пример предложения</label>
          <textarea
            value={form.example_sentence}
            onChange={(e) => update('example_sentence', e.target.value)}
            rows={2}
            className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 font-medium"
        >
          {saving ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Добавить'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2"
      />
    </div>
  );
}
