// Thin wrapper around api.telegram.org -- no library, just fetch. The bot
// uses long polling (getUpdates), never a webhook, so there's no need for
// a public HTTPS endpoint dedicated to Telegram.

const BASE = 'https://api.telegram.org';

export function createTelegramClient(token) {
  async function call(method, params = {}) {
    const res = await fetch(`${BASE}/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!data.ok) {
      throw new Error(`Telegram API ${method} failed: ${data.description || res.status}`);
    }
    return data.result;
  }

  return {
    sendMessage(chatId, text) {
      return call('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML' });
    },
    getUpdates(offset, timeoutSeconds) {
      return call('getUpdates', { offset, timeout: timeoutSeconds, allowed_updates: ['message'] });
    }
  };
}
