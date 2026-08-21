// Server-side port of the acceptableAnswers() helper in
// client/src/components/quiz/TypingQuiz.jsx -- translation_ru often
// lists more than one accepted answer ("вариант1 / вариант2" or
// "вариант1, вариант2"), sometimes with a parenthetical note that isn't
// part of the answer itself. Strip parentheticals BEFORE splitting (a
// parenthetical can itself contain a "/", e.g. "относить, отводить
// (кого-то/что-то куда-то)") so any one of the real alternatives counts.
export function acceptableAnswers(expected) {
  return expected
    .replace(/\([^)]*\)/g, '')
    .split(/[,/]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
