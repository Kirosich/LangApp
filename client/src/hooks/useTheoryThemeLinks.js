import { useEffect, useState } from 'react';
import { api } from '../api/client';

// Maps "language::theme" -> { topic_slug, topic_title } for the small set
// of card themes that have a linked theory reference topic (Stage 3).
export function useTheoryThemeLinks() {
  const [links, setLinks] = useState({});

  useEffect(() => {
    api
      .getTheoryThemeLinks()
      .then((rows) => {
        const map = {};
        for (const row of rows) map[`${row.language}::${row.theme}`] = row;
        setLinks(map);
      })
      .catch(() => {});
  }, []);

  return links;
}
