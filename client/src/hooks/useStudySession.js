import { useEffect, useRef } from 'react';
import { api, endSessionOnUnload } from '../api/client';

export function useStudySession(sessionType) {
  const sessionIdRef = useRef(null);
  const countRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    api
      .startSession(sessionType)
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
      if (sessionIdRef.current) endSessionOnUnload(sessionIdRef.current, countRef.current);
    }
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      cancelled = true;
      window.removeEventListener('pagehide', handlePageHide);
      if (sessionIdRef.current) {
        api.endSession(sessionIdRef.current, countRef.current).catch(() => {});
        sessionIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function recordCard() {
    countRef.current += 1;
  }

  return { recordCard };
}
