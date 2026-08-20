// Short "what you can already do" formulations, unlocked once 80%+ of a
// theme's cards are learned (repetitions >= 2 and easiness_factor >= 2.5).
export const UNLOCK_THRESHOLD_PERCENT = 80;

export const THEME_MILESTONES = {
  еда: 'Можешь заказать еду в кафе и понять меню',
  природа: 'Можешь описать погоду и то, что видишь вокруг — деревья, солнце, небо',
  'числа/время': 'Можешь назвать числа, время и договориться о встрече',
  бытовое: 'Можешь поздороваться, поблагодарить и объясниться в быту',
  глаголы: 'Можешь строить простые фразы о действиях — что делаешь, хочешь, идёшь'
};

export function milestoneForTheme(theme) {
  return THEME_MILESTONES[theme] ?? `Можешь уверенно использовать слова по теме «${theme}»`;
}
