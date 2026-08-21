// One-off script: backfills the `level` (CEFR) column for cards that
// existed before it was introduced. Not part of runMigrations() since
// this is a judgment-call data backfill, not a schema/structural change --
// run once via `node backfill-levels.js`, safe to re-run (idempotent,
// just re-asserts the same values).
import { db } from './db/index.js';

// Kazakh: mostly A1-A2, matching how the deck was built (self-study
// A2 track). A handful of items are genuinely more complex than their
// theme's average -- rare/formal words, compound medical/financial
// phrases -- and are marked B1 rather than stamped with the theme's
// dominant level.
const KZ_LEVELS = {
  1: 'A1', 2: 'A1', 3: 'A1', 4: 'A1', 5: 'A1', 51: 'A1', 52: 'A1', 53: 'A1', 54: 'A1', 55: 'A1',
  165: 'A1', 166: 'A1', 167: 'A1', 168: 'A1', 169: 'A1', 170: 'A1', 171: 'A2', 172: 'A1', 173: 'A1',
  174: 'A1', 175: 'A2', 176: 'A2', 177: 'B1', 178: 'A2',
  14: 'A1', 85: 'A1', 86: 'A1', 87: 'A1', 88: 'A1', 89: 'A2',
  146: 'A2', 147: 'A2', 148: 'A2', 149: 'A2', 150: 'A2', 151: 'A2', 152: 'A2', 153: 'A2', 154: 'A2',
  155: 'A2', 156: 'A2', 157: 'B1', 158: 'A2', 159: 'B1', 160: 'B1', 161: 'A2', 162: 'A2', 163: 'B1', 164: 'A2',
  127: 'A1', 128: 'A1', 129: 'A1', 130: 'A1', 131: 'A1', 132: 'A1', 133: 'A1', 134: 'A1', 135: 'A1',
  136: 'A1', 137: 'A1', 138: 'A1', 139: 'A1', 140: 'A1', 141: 'A1', 142: 'A1', 143: 'A1', 144: 'A1', 145: 'A1',
  67: 'A1', 68: 'A1', 69: 'A1', 70: 'A1', 71: 'A1',
  12: 'A1',
  179: 'A2', 180: 'A2', 181: 'A2', 182: 'A2', 183: 'A2', 184: 'A2', 185: 'A2', 186: 'A2', 187: 'A2',
  188: 'B1', 189: 'A2', 190: 'A2', 191: 'A2', 192: 'A2', 193: 'A2', 194: 'A2', 195: 'A2', 196: 'B1', 197: 'B1', 198: 'A2',
  219: 'A1', 220: 'A1', 221: 'A1', 222: 'A1', 223: 'A1', 224: 'A1', 225: 'A1', 226: 'A2', 227: 'A1', 228: 'A1',
  229: 'A2', 230: 'A2', 231: 'A1', 232: 'A1', 233: 'A1', 234: 'A1', 235: 'A2', 236: 'A2', 237: 'A2', 238: 'A2', 239: 'A1',
  90: 'A1', 91: 'A1', 92: 'A2', 93: 'A1', 94: 'A2', 95: 'A1', 96: 'A1', 97: 'A2', 98: 'B1', 99: 'B1',
  100: 'A2', 101: 'A1', 102: 'A2', 103: 'A2', 104: 'A1', 105: 'A1', 106: 'A1', 107: 'A2', 108: 'A1',
  109: 'A1', 110: 'A1', 111: 'A1', 112: 'A1', 113: 'A1', 114: 'A2', 115: 'A2', 116: 'B1', 117: 'A2',
  118: 'A2', 119: 'A1', 120: 'A1', 121: 'A1', 122: 'A2', 123: 'A2', 124: 'B1', 125: 'A1', 126: 'A1',
  199: 'A1', 200: 'A2', 201: 'A1', 202: 'A1', 203: 'A1', 204: 'A2', 205: 'B1', 206: 'A2', 207: 'A2',
  208: 'A1', 209: 'A2', 210: 'A2', 211: 'A1', 212: 'A2', 213: 'A2', 214: 'B1', 215: 'A2', 216: 'B1', 217: 'B1', 218: 'A2',
  77: 'A1', 78: 'A1', 79: 'A2', 80: 'A2',
  56: 'A1', 57: 'A1', 58: 'A1', 59: 'A1', 60: 'A1', 61: 'A1',
  62: 'A1', 63: 'A1', 64: 'A1', 65: 'A1', 66: 'A1',
  72: 'A1', 73: 'A2', 74: 'A1', 75: 'A1', 76: 'A1',
  11: 'A1',
  81: 'A2', 82: 'A2', 83: 'A2', 84: 'A2'
};

// English: existing deck is a mix of a few leftover basic seed cards
// (Run/Water/Bread/Tree/Sun/One/Today -- genuinely A1, predate the B2
// focus) and the B2-C1 vocabulary/phrase sets. Idioms and precise
// synonyms lean C1 where they're genuinely less common, not just
// because they're in an "idioms" bucket.
const EN_LEVELS = {
  26: 'C1', 27: 'C1', 28: 'C1', 29: 'C1', 30: 'B2', 31: 'B2', 32: 'B2', 33: 'B2',
  360: 'B2', 361: 'C1', 362: 'B2', 363: 'B2', 364: 'B2', 365: 'C1', 366: 'C1', 367: 'B2', 368: 'B2',
  369: 'B2', 370: 'C1', 371: 'B2', 372: 'B2', 373: 'B2', 374: 'B2', 375: 'B2', 376: 'B2', 377: 'C1',
  378: 'B2', 379: 'B2', 380: 'B2', 381: 'C1', 382: 'C1', 383: 'B2', 384: 'B2', 385: 'B2', 386: 'B2',
  387: 'B2', 388: 'C1', 389: 'B2',
  9: 'A1',
  34: 'C1', 35: 'B2', 36: 'B2', 37: 'B2', 38: 'B2', 39: 'C1', 40: 'C1',
  6: 'A1', 7: 'A1',
  46: 'B2', 47: 'B2', 48: 'B2', 49: 'C1', 50: 'B2',
  300: 'B2', 301: 'B2', 302: 'B1', 303: 'B2', 304: 'B2', 305: 'B2', 306: 'C1', 307: 'B2', 308: 'B2',
  309: 'B2', 310: 'C1', 311: 'B2', 312: 'B2', 313: 'C1', 314: 'B2', 315: 'B2', 316: 'B2', 317: 'B2',
  318: 'B2', 319: 'C1', 320: 'B2', 321: 'B2', 322: 'C1', 323: 'B1', 324: 'B1', 325: 'C1', 326: 'B2',
  327: 'B1', 328: 'B1', 329: 'B1',
  8: 'A1', 10: 'A1',
  240: 'B2', 241: 'B2', 242: 'C1', 243: 'C1', 244: 'B2', 245: 'B2', 246: 'B2', 247: 'B2', 248: 'C1',
  249: 'C1', 250: 'B2', 251: 'B2', 252: 'C1', 253: 'B2', 254: 'C1', 255: 'B2', 256: 'B2', 257: 'C1',
  258: 'C1', 259: 'C1', 260: 'C1', 261: 'C1', 262: 'C1', 263: 'B2', 264: 'B2', 265: 'C1', 266: 'B2',
  267: 'B2', 268: 'B2', 269: 'B2',
  16: 'C1', 17: 'B2', 18: 'B2', 19: 'B2', 20: 'B2', 21: 'B2', 22: 'B2', 23: 'B2', 24: 'C1', 25: 'C1',
  330: 'B2', 331: 'B2', 332: 'B2', 333: 'C1', 334: 'B2', 335: 'B2', 336: 'B2', 337: 'B2', 338: 'C1',
  339: 'B2', 340: 'B2', 341: 'B2', 342: 'B2', 343: 'C1', 344: 'C1', 345: 'C1', 346: 'B2', 347: 'B2',
  348: 'C1', 349: 'B2', 350: 'B2', 351: 'C1', 352: 'B2', 353: 'B2', 354: 'B2', 355: 'B2', 356: 'C1',
  357: 'C1', 358: 'B2', 359: 'C1',
  270: 'B1', 271: 'B1', 272: 'B1', 273: 'B2', 274: 'B2', 275: 'B2', 276: 'C1', 277: 'B2', 278: 'B1',
  279: 'B2', 280: 'C1', 281: 'B1', 282: 'B2', 283: 'B2', 284: 'B1', 285: 'B2', 286: 'B2', 287: 'B2',
  288: 'B1', 289: 'B1', 290: 'B2', 291: 'B2', 292: 'C1', 293: 'B2', 294: 'B2', 295: 'B2', 296: 'B2',
  297: 'B2', 298: 'B2', 299: 'B1',
  13: 'A1', 15: 'A1',
  41: 'B2', 42: 'C1', 43: 'B2', 44: 'B2', 45: 'B2'
};

function backfill(levels) {
  const stmt = db.prepare('UPDATE cards SET level = ? WHERE id = ?');
  const run = db.transaction((entries) => {
    let updated = 0;
    for (const [id, level] of entries) {
      updated += stmt.run(level, Number(id)).changes;
    }
    return updated;
  });
  return run(Object.entries(levels));
}

const kzUpdated = backfill(KZ_LEVELS);
const enUpdated = backfill(EN_LEVELS);
console.log(`Backfilled level: kz=${kzUpdated}, en=${enUpdated}`);

const missing = db.prepare("SELECT id, language, term FROM cards WHERE level IS NULL").all();
if (missing.length > 0) {
  console.log(`WARNING: ${missing.length} card(s) still have no level:`, missing);
} else {
  console.log('All cards have a level.');
}

const byLevel = db
  .prepare('SELECT language, level, COUNT(*) AS count FROM cards GROUP BY language, level ORDER BY language, level')
  .all();
console.table(byLevel);
