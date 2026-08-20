const LEVEL_COLORS = ['bg-neutral-800', 'bg-indigo-900', 'bg-indigo-700', 'bg-indigo-500', 'bg-indigo-400'];
const WEEKDAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function levelFor(count, max) {
  if (count === 0 || max <= 0) return 0;
  const ratio = count / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

function buildWeeks(data) {
  if (data.length === 0) return [];
  const firstWeekday = new Date(`${data[0].date}T00:00:00Z`).getUTCDay();
  const weeks = [];

  data.forEach((entry, i) => {
    const slot = firstWeekday + i;
    const weekIndex = Math.floor(slot / 7);
    const dayIndex = slot % 7;
    if (!weeks[weekIndex]) weeks[weekIndex] = Array(7).fill(null);
    weeks[weekIndex][dayIndex] = entry;
  });

  return weeks;
}

export default function Heatmap({ data }) {
  const max = Math.max(0, ...data.map((d) => d.cards_reviewed));
  const weeks = buildWeeks(data);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 w-max">
        <div className="flex flex-col gap-[3px] pt-[2px]">
          {WEEKDAY_LABELS.map((label, i) => (
            <div key={i} className="h-[11px] text-[9px] leading-[11px] text-neutral-600 w-4">
              {i % 2 === 1 ? label : ''}
            </div>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) =>
                day ? (
                  <div
                    key={di}
                    title={`${day.date}: ${day.cards_reviewed} карточек, ${day.minutes} мин`}
                    className={`size-[11px] rounded-sm ${LEVEL_COLORS[levelFor(day.cards_reviewed, max)]}`}
                  />
                ) : (
                  <div key={di} className="size-[11px]" />
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
