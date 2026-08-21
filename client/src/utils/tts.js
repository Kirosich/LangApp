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

    let settled = false;
    function finish() {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      const voices = window.speechSynthesis.getVoices();
      if (import.meta.env.DEV || window.__langappTtsDebug) {
        const kzVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('kk'));
        // eslint-disable-next-line no-console
        console.info(
          `[tts] resolved ${voices.length} voice(s); kk-matching: ${kzVoices.length ? kzVoices.map((v) => `${v.name} (${v.lang})`).join(', ') : 'none'}`
        );
      }
      resolve(voices);
    }
    function onVoicesChanged() {
      finish();
    }
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);

    // Some browsers return a small "default" batch of voices synchronously,
    // with the rest of the list -- including less common languages like
    // kk-KZ -- arriving later via voiceschanged. Trusting a non-empty
    // snapshot immediately can permanently miss those, since this promise
    // is cached and only resolved once. Give the async batch a short grace
    // window when something's already loaded, or the full fallback window
    // when starting from empty, then settle for whatever's loaded by then.
    const graceMs = window.speechSynthesis.getVoices().length > 0 ? 300 : 1500;
    setTimeout(finish, graceMs);
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
