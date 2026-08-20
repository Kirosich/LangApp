import { useEffect, useState } from 'react';
import { findVoice, isSupported, langCode } from '../utils/tts';

// Resolves the best available voice for `language` once (on mount), then
// exposes a synchronous speak() -- calling speechSynthesis.speak() must
// happen synchronously inside the click handler on iOS Safari, or the
// browser silently drops it as not being a direct result of a user
// gesture. So all the async voice lookup happens ahead of time here, not
// inside speak() itself.
export function useSpeech(language) {
  const [voice, setVoice] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setChecked(false);
    if (!isSupported()) {
      setChecked(true);
      return;
    }
    findVoice(language).then((v) => {
      if (cancelled) return;
      setVoice(v);
      setChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [language]);

  const supported = isSupported() && checked && Boolean(voice);

  function speak(text) {
    if (!isSupported()) return;
    window.speechSynthesis.cancel(); // don't queue up repeated taps
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice?.lang || langCode(language);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }

  return { supported, speak };
}
