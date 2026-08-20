import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '..', '..', 'data', 'app.db');
const BACKUP_DIR = process.env.BACKUP_DIR || '/app/backups';
const KEEP_LAST = 14;

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

async function main() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const target = path.join(BACKUP_DIR, `app-${todayStamp()}.db`);
  if (fs.existsSync(target)) fs.unlinkSync(target);

  const source = new Database(DB_PATH, { readonly: true });
  await source.backup(target);
  source.close();

  // Verify the backup is actually readable before trusting it.
  const check = new Database(target, { readonly: true });
  const { count } = check.prepare('SELECT COUNT(*) AS count FROM cards').get();
  check.close();
  if (!Number.isInteger(count)) {
    throw new Error('Backup verification failed: could not read cards count');
  }

  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => /^app-\d{4}-\d{2}-\d{2}\.db$/.test(f))
    .sort()
    .reverse();
  const stale = files.slice(KEEP_LAST);
  for (const f of stale) {
    fs.unlinkSync(path.join(BACKUP_DIR, f));
  }

  console.log(`Backup OK: ${target} (${count} cards). Kept ${files.length - stale.length}, removed ${stale.length} old backups.`);
}

main().catch((err) => {
  console.error('Backup FAILED:', err.message);
  process.exit(1);
});
