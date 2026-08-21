import { useEffect, useRef } from 'react';
import { api, endSessionOnUnload } from '../api/client';

export function useStudySession(sessionType, language) {
  const sessionIdRef = useRef(null);
  const countRef = useRef(0);
  const endedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    api
      .startSession(sessionType, language)
      .then((res) => {
        if (cancelled) {
          // Effect was already cleaned up (e.g. React StrictMode's dev double-invoke)
          // before this resolved — close the orphaned session immediately.
          api.endSession(res.id, countRef.current).catch(() => {});
        } else {
          sessionIdRef.current = res.id;
        }
      })
      .catch(() => {});

    function handlePageHide() {
      if (!endedRef.current && sessionIdRef.current) {
        endSessionOnUnload(sessionIdRef.current, countRef.current);
        endedRef.current = true;
      }
    }
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      cancelled = true;
      window.removeEventListener('pagehide', handlePageHide);
      if (!endedRef.current && sessionIdRef.current) {
        api.endSession(sessionIdRef.current, countRef.current).catch(() => {});
        endedRef.current = true;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function recordCard() {
    countRef.current += 1;
  }

  async function endNow() {
    if (endedRef.current || !sessionIdRef.current) return null;
    endedRef.current = true;
    try {
      return await api.endSession(sessionIdRef.current, countRef.current);
    } catch {
      return null;
    }
  }

  return { recordCard, endNow };
}
