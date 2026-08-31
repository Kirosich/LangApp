import { useEffect, useRef } from 'react';
import { api, endSessionOnUnload } from '../api/client';

// How long the tab can stay hidden (phone locked, app backgrounded,
// switched away) before we stop counting it as active study time. Below
// this, a quick notification-check doesn't fragment the session; above
// it, the elapsed wall-clock time would otherwise get counted as study
// minutes even though nothing was happening (started_at/ended_at is a
// plain timestamp diff on the server, no activity tracking there).
const HIDDEN_TIMEOUT_MS = 3 * 60 * 1000;

export function useStudySession(sessionType, language) {
  const sessionIdRef = useRef(null);
  const countRef = useRef(0);
  const endedRef = useRef(false);
  const hiddenTimerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    function startSession() {
      endedRef.current = false;
      countRef.current = 0;
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
    }

    function endCurrentSession() {
      if (!endedRef.current && sessionIdRef.current) {
        api.endSession(sessionIdRef.current, countRef.current).catch(() => {});
        endedRef.current = true;
      }
    }

    function clearHiddenTimer() {
      if (hiddenTimerRef.current) {
        clearTimeout(hiddenTimerRef.current);
        hiddenTimerRef.current = null;
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        clearHiddenTimer();
        hiddenTimerRef.current = setTimeout(endCurrentSession, HIDDEN_TIMEOUT_MS);
      } else {
        clearHiddenTimer();
        // Was away long enough that the previous session already got
        // closed out -- pick back up with a fresh one instead of letting
        // the idle gap silently inflate the old session's minutes.
        if (endedRef.current) startSession();
      }
    }

    function handlePageHide() {
      clearHiddenTimer();
      if (!endedRef.current && sessionIdRef.current) {
        endSessionOnUnload(sessionIdRef.current, countRef.current);
        endedRef.current = true;
      }
    }

    startSession();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      cancelled = true;
      clearHiddenTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      endCurrentSession();
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
