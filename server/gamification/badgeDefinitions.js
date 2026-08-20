export const BADGE_DEFINITIONS = [
  { code: 'streak_7', icon: '🔥', title: 'Неделя подряд', description: 'Streak 7 дней' },
  { code: 'streak_30', icon: '🏆', title: 'Месяц подряд', description: 'Streak 30 дней' },
  { code: 'words_100', icon: '💯', title: '100 слов', description: '100 выученных слов' },
  { code: 'words_250', icon: '🎓', title: '250 слов', description: '250 выученных слов' },
  { code: 'perfect_quiz', icon: '✨', title: 'Идеально', description: 'Квиз без единой ошибки' },
  { code: 'night_owl', icon: '🦉', title: 'Сова', description: 'Занятие между полуночью и 4 утра' },
  { code: 'marathon_30min', icon: '🏃', title: 'Марафонец', description: 'Сессия дольше 30 минут' }
];

const QUIZ_SESSION_TYPES = new Set(['quiz_choice', 'quiz_typing', 'quiz_matching']);

export function isQuizSession(sessionType) {
  return QUIZ_SESSION_TYPES.has(sessionType);
}
