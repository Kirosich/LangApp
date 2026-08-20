import { useSpeech } from '../hooks/useSpeech';

// Renders nothing if the browser has no voice for this language -- no
// backend, no pre-generated audio (yet), so silence just means "not
// available here" rather than showing a button that does nothing.
export default function SpeakButton({ text, language, className = '' }) {
  const { supported, speak } = useSpeech(language);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      aria-label="Произнести"
      title="Произнести"
      className={`inline-flex items-center justify-center leading-none hover:text-indigo-400 ${className}`}
    >
      🔊
    </button>
  );
}
