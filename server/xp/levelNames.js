// A2-compatible Kazakh nouns tracing a "beginner -> confident" arc, one per
// level 1-15. Shown next to the bare level number so leveling up doubles as
// light vocabulary exposure. Levels above 15 reuse the last (highest) name.
export const LEVEL_NAMES = [
  { kz: 'Бастау', ru: 'начало' },
  { kz: 'Қадам', ru: 'шаг' },
  { kz: 'Жол', ru: 'путь' },
  { kz: 'Талап', ru: 'старание' },
  { kz: 'Жаттығу', ru: 'тренировка' },
  { kz: 'Дағды', ru: 'навык' },
  { kz: 'Білім', ru: 'знание' },
  { kz: 'Тәжірибе', ru: 'опыт' },
  { kz: 'Жетістік', ru: 'достижение' },
  { kz: 'Шеберлік', ru: 'мастерство' },
  { kz: 'Батылдық', ru: 'смелость' },
  { kz: 'Табандылық', ru: 'упорство' },
  { kz: 'Дербестік', ru: 'самостоятельность' },
  { kz: 'Еркіндік', ru: 'свобода' },
  { kz: 'Сенімділік', ru: 'уверенность' }
];

export function levelName(level) {
  const index = Math.min(Math.max(level, 1), LEVEL_NAMES.length) - 1;
  return LEVEL_NAMES[index];
}
