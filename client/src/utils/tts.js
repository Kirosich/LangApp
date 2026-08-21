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
      const debugEnabled =
        import.meta.env.DEV || window.__langappTtsDebug || new URLSearchParams(window.location.search).get('ttsdebug') === '1';
      if (debugEnabled) {
        const kzVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('kk'));
        const summary = `[tts] resolved ${voices.length} voice(s); kk-matching: ${
          kzVoices.length ? kzVoices.map((v) => `${v.name} (${v.lang})`).join(', ') : 'none'
        }`;
        // eslint-disable-next-line no-console
        console.info(summary);
        // On-screen fallback for devices without easy devtools access
        // (e.g. iOS Safari) -- append ?ttsdebug=1 to any page URL.
        const el = document.createElement('div');
        el.textContent = summary;
        el.style.cssText =
          'position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;font:11px monospace;padding:8px;word-break:break-word;';
        document.body.appendChild(el);
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
