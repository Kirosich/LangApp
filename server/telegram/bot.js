import { db } from '../db/index.js';
import { createTelegramClient } from './api.js';
import { getStatsSnapshot, getDueSnapshot, getWeeklyRecapSnapshot, hadSessionToday } from './queries.js';
import { nextAlmatyOccurrence } from './almatyTime.js';
import { BADGE_DEFINITIONS } from '../gamification/badgeDefinitions.js';

const LANGUAGE_LABEL = { kz: 'Казахский', en: 'English' };

// Module-level state: set once by startTelegramBot() if credentials are
// configured. notifyLevelUp/notifyBadges below are safe no-ops otherwise,
// so routes can call them unconditionally without checking "is the bot
// running" themselves.
let client = null;
let allowedChatId = null;

function byLanguage(counts) {
  return Object.entries(counts)
    .map(([lang, count]) => `${LANGUAGE_LABEL[lang] ?? lang}: ${count}`)
    .join(', ');
}

function formatStats(s) {
  return [
    `Уровень ${s.level} (${s.level_name.ru}) — ${s.total_xp} XP`,
    `Streak: ${s.streak} дн.`,
    `Выучено слов: ${byLanguage(s.learned_by_language)}`,
    `Время сегодня: ${s.minutes_today} мин, за неделю: ${s.minutes_week} мин`
  ].join('\n');
}

function formatDue(d) {
  return [
    `К повторению сейчас: ${byLanguage(d.due_by_language)}`,
    `Новых из склада сегодня ещё введётся: ${byLanguage(d.new_remaining_by_language)}`
  ].join('\n');
}

function formatRecap(r) {
  return [
    '📊 Неделя в цифрах',
    `Карточек повторено: ${r.cards_reviewed}`,
    `Время в занятиях: ${r.minutes} мин`,
    `Активных дней: ${r.days_active} / 7`,
    `Текущий streak: ${r.streak} дн.`
  ].join('\n');
}

const HELP_TEXT = ['/stats — уровень, XP, streak, слов выучено, время', '/due — сколько карточек ждёт сегодня', '/help — этот список'].join(
  '\n'
);

function handleCommand(text) {
  const command = text.trim().split(/\s+/)[0].toLowerCase();
  if (command === '/stats') return formatStats(getStatsSnapshot(db));
  if (command === '/due') return formatDue(getDueSnapshot(db));
  if (command === '/help' || command === '/start') return HELP_TEXT;
  return null; // unknown command -- stay silent rather than guessing what was meant
}

async function pollLoop() {
  let offset = 0;
  for (;;) {
    let updates;
    try {
      updates = await client.getUpdates(offset, 30);
    } catch (err) {
      console.error('[telegram] getUpdates failed:', err.message);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }

    for (const update of updates) {
      offset = update.update_id + 1;
      const message = update.message;
      if (!message?.text) continue;

      // Only the one configured chat gets a response -- everyone else is
      // silently ignored, not even an error reply.
      if (String(message.chat.id) !== allowedChatId) continue;

      let reply;
      try {
        reply = handleCommand(message.text);
      } catch (err) {
        console.error('[telegram] command handling failed:', err.message);
        continue;
      }
      if (!reply) continue;

      await client.sendMessage(allowedChatId, reply).catch((err) => console.error('[telegram] sendMessage failed:', err.message));
    }
  }
}

// Self-rescheduling timer: each firing recomputes the next occurrence
// from the current real time rather than relying on any persisted
// state, so a container restart just re-derives the correct delay --
// there's nothing to "recover".
function scheduleRecurring({ hour, minute, weekday = null }, action) {
  function fire() {
    action().catch((err) => console.error('[telegram] scheduled task failed:', err.message));
    scheduleRecurring({ hour, minute, weekday }, action);
  }
  const delay = nextAlmatyOccurrence({ hour, minute, weekday }).getTime() - Date.now();
  setTimeout(fire, delay);
}

async function sendEveningReminderIfNeeded() {
  if (hadSessionToday(db)) return; // studied already today (Almaty) -- stay quiet
  const stats = getStatsSnapshot(db);
  const due = getDueSnapshot(db);
  const totalDue = Object.values(due.due_by_language).reduce((sum, n) => sum + n, 0);
  await client.sendMessage(allowedChatId, `Сегодня ещё не было занятия. Streak: ${stats.streak} дней. Карточек к повторению: ${totalDue}.`);
}

async function sendWeeklyRecap() {
  await client.sendMessage(allowedChatId, formatRecap(getWeeklyRecapSnapshot(db)));
}

// Both notify* functions are safe to call unconditionally from routes,
// bot or no bot -- they're no-ops until startTelegramBot() has actually
// configured a client. Hooks into the *existing* XP/badge logic
// (cards.js /review and /master, theoryReference.js /read, sessions.js
// /:id/end) rather than recomputing level-up or badge state separately.
export function notifyLevelUp(newLevel) {
  if (!client) return;
  client.sendMessage(allowedChatId, `🎉 Новый уровень: ${newLevel}!`).catch((err) => console.error('[telegram] notify failed:', err.message));
}

export function notifyBadges(badgeCodes) {
  if (!client || !badgeCodes?.length) return;
  for (const code of badgeCodes) {
    const badge = BADGE_DEFINITIONS.find((b) => b.code === code);
    if (!badge) continue;
    client
      .sendMessage(allowedChatId, `${badge.icon} Новый бейдж: ${badge.title} — ${badge.description}`)
      .catch((err) => console.error('[telegram] notify failed:', err.message));
  }
}

export function startTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set -- bot disabled, app runs normally.');
    return;
  }

  client = createTelegramClient(token);
  allowedChatId = chatId;

  pollLoop();
  scheduleRecurring({ hour: 19, minute: 0 }, sendEveningReminderIfNeeded);
  scheduleRecurring({ hour: 10, minute: 0, weekday: 1 }, sendWeeklyRecap); // 1 = Monday

  console.log('[telegram] bot started (long polling)');
}
