// Web Speech API (speechSynthesis) helpers. No backend, no audio files —
// pronunciation is synthesized by whatever voices the device/browser
// ships with. Voice availability varies a lot by platform, especially
// for Kazakh (kk-KZ), so everything here is feature-detected rather than
// assumed.

const BCP47 = { kz: 'kk-KZ', en: 'en-US' };

let voicesPromise = null;

function loadVoices() {
  if (voicesPromise) return voicesPromise;

  voicesPromise = new Promise((resolve) => {
    if (!isSupported()) return resolve([]);

    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) return resolve(existing);

    // Voices frequently load asynchronously (especially on mobile Safari
    // and Chrome) -- the first getVoices() call right after page load
    // often returns an empty list.
    function onVoicesChanged() {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(voices);
      }
    }
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);

    // Some browsers never fire voiceschanged if the list stays empty --
    // don't leave callers waiting forever.
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1500);
  });

  return voicesPromise;
}

export function isSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export async function findVoice(language) {
  const bcp47 = BCP47[language];
  if (!bcp47 || !isSupported()) return null;

  const voices = await loadVoices();
  const prefix = bcp47.split('-')[0].toLowerCase();
  return (
    voices.find((v) => v.lang.toLowerCase() === bcp47.toLowerCase()) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ||
    null
  );
}

export function langCode(language) {
  return BCP47[language] || 'en-US';
}
