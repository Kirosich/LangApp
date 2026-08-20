# Langapp

Личное приложение для изучения казахского (A2) и английского (B2) через
карточки со spaced repetition (SM-2), квизы и отдельный раздел теории
(грамматика). Живёт на эфиргейм.рф, вместе с побочным проектом того же
домена.

## Функции

**Карточки и повторение**
- SRS по SM-2 (`server/srs/sm2.js`) — интервалы, коэффициент лёгкости,
  дата следующего повторения
- Три типа квиза: multiple choice, typing (толерантность к опечаткам,
  Левенштейн ≤1), matching pairs
- «Тренировка» — свободный прогон карточек (флип-карты без оценок) без
  влияния на SRS-расписание: либо как бонус-раунд после обычной сессии
  повторения, либо отдельным входом с дашборда на заданное число слов
  (по умолчанию 100), зацикливается с новой перетасовкой после каждого
  прохода
- «Знаю досконально» — пометка карточки как mastered, чтобы больше не
  показывалась ни в SRS, ни в квизах (`/api/cards/:id/master`)
- Склад (backlog): новые карточки не сваливаются в SRS все разом, а
  вводятся дозированно по дням (`server/backlog/introduce.js`),
  с настройкой темпа и ручным «бустом» на дашборде

**Теория (грамматика)**
- Отдельный раздел параллельно вокабуляру: курс → блоки (план/факт
  минуты, статус) → пункты-чеклист с заметками
  (`server/routes/theory.js`, `client/src/pages/Theory*.jsx`)
- Плюс независимый мини-справочник теоретических тем со своим прогрессом
  прочтения (`server/routes/theoryReference.js`)

**Геймификация и статистика**
- XP и уровни за повторения/квизы/мастеринг (`server/xp/`)
- Бейджи, личные рекорды, streak (дней подряд с завершённой сессией)
- Графики: heatmap активности за 90 дней, накопительный прогресс,
  разбивка по темам, тренд точности квизов, проблемные карточки,
  недельный recap, время в занятиях (сегодня/неделя/всё время)
- Учёт сессий (`study_sessions`) — время и количество карточек, отдельно
  для study/quiz

## Стек

- **Backend**: Node.js + Express, SQLite (`better-sqlite3`), Basic Auth
- **Frontend**: Vite + React + Tailwind CSS, тёмная тема, мобильный-дружелюбный
- **Деплой**: Docker + docker-compose + Caddy (авто-HTTPS), GitHub Actions

## Структура проекта

```
langapp/
├── server/           # Express API + SQLite + SM-2
│   ├── db/           # подключение к БД и миграции (выполняются при старте)
│   ├── srs/          # sm2.js — чистая функция алгоритма SM-2
│   ├── xp/           # расчёт XP и уровней
│   ├── gamification/ # определения бейджей, хук на конец сессии
│   ├── backlog/       # дозированное введение новых карточек
│   ├── routes/        # cards, quiz, stats, sessions, theory,
│   │                   # theoryReference, gamification, backlog
│   ├── middleware/    # Basic Auth
│   ├── __tests__/     # unit-тесты (vitest)
│   ├── seed.js                  # стартовые карточки
│   ├── seed-theory*.js          # курсы теории (казахский/английский)
│   └── seed-vocab-advanced.js   # расширенная лексика
├── client/           # React + Tailwind SPA
│   └── src/
│       ├── pages/        # Dashboard, Study, Quiz, Browse, AddCard,
│       │                 # KnownWords, Settings, Theory*, Login
│       ├── components/   # Layout, компоненты квизов, progress/ (графики)
│       ├── api/          # обёртка над fetch с Basic Auth
│       ├── hooks/        # useStudySession — трекинг времени сессии
│       └── context/      # AuthContext
├── data/             # SQLite-файл (app.db) + бэкапы, не в git
├── Dockerfile        # multi-stage: сборка client -> прод-образ с API
├── docker-compose.yml
├── Caddyfile
└── .github/workflows/deploy.yml
```

## Локальный запуск

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # при желании поменяйте логин/пароль
npm run seed           # один раз — заполнит БД стартовыми карточками
npm run dev            # http://localhost:3000
```

### 2. Frontend

```bash
cd client
npm install
npm run dev             # http://localhost:5173, проксирует /api на localhost:3000
```

Откройте `http://localhost:5173`, войдите с логином/паролем из `server/.env`.

### Тесты

```bash
cd server
npm test                # unit-тесты алгоритма SM-2
```

## Сборка и деплой через Docker Compose

1. На сервере склонируйте репозиторий и создайте `server/.env` (см.
   `server/.env.example`) с реальными логином/паролем.
2. Отредактируйте `Caddyfile`, указав свой домен вместо
   `your-domain.example.com`.
3. Запустите:

   ```bash
   docker compose up -d --build
   ```

   Сервис `app` соберёт client, поднимет Express на порту 3000 (данные
   SQLite хранятся в `./data`, смонтированной volume), `caddy` отдаст
   его наружу по HTTPS с автоматическим сертификатом Let's Encrypt.

## Автодеплой (GitHub Actions)

`.github/workflows/deploy.yml` запускается при каждом push в `master`:
подключается по SSH к серверу и выполняет `git pull && docker compose
up -d --build`. Для работы нужно завести 3 секрета в **Settings →
Secrets and variables → Actions**:

- `DEPLOY_SSH_KEY` — приватный SSH-ключ для деплоя
- `SSH_HOST` — адрес сервера
- `SSH_USER` — пользователь на сервере

## API

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/cards/due?language=` | карточки к повторению сегодня (SM-2) |
| GET | `/api/cards?theme=&language=&ids=&status=` | список/фильтр карточек (`status`: active/backlog/mastered) |
| GET | `/api/cards/known?language=` | освоенные карточки |
| POST | `/api/cards` | добавить карточку |
| POST | `/api/cards/import` | массовый импорт карточек |
| PUT | `/api/cards/:id` | редактировать карточку |
| DELETE | `/api/cards/:id` | удалить карточку |
| POST | `/api/cards/:id/review` | отправить оценку (0–5), обновить SM-2, начислить XP |
| POST | `/api/cards/:id/master` / `/unmaster` | пометить как «уже знаю» / вернуть в оборот |
| GET | `/api/quiz?type=choice\|typing\|matching&theme=&language=&count=` | сгенерировать квиз |
| GET | `/api/stats?language=` | всего карточек, к повторению, streak, по темам |
| POST | `/api/sessions/start` / `POST /api/sessions/:id/end` | трекинг длительности сессии study/quiz |
| GET/POST/PUT/DELETE | `/api/theory/courses`, `/blocks`, `/items` | курсы теории → блоки → пункты-чеклист |
| GET | `/api/theory?language=` / `/api/theory/:slug` | мини-справочник теоретических тем |
| POST | `/api/theory/:slug/read` | отметить тему прочитанной, начислить XP |
| GET | `/api/gamification/summary` \| `/badges` \| `/heatmap` \| `/cumulative` \| `/topics-breakdown` \| `/accuracy-trend` \| `/problem-cards` \| `/milestones` \| `/weekly-recap` | статистика и геймификация для дашборда |
| GET | `/api/backlog/summary` \| `/settings` | состояние и настройки склада новых карточек |
| PUT | `/api/backlog/settings` | темп ввода новых карточек в день |
| POST | `/api/backlog/boost` | разово ввести N карточек из склада сверх нормы |

Все запросы требуют Basic Auth (логин/пароль из `.env`).

## Обновления

Ключевые изменения по датам — веду по мере доработки приложения.

- **2026-08-20** — режим свободной «Тренировки»: вход с дашборда на
  заданное число случайных карточек (по умолчанию 100), без влияния на
  SM-2-расписание; отдельно от бонус-раунда после обычной сессии.
- **2026-08-20** — исправлен «прыгающий» нижний навбар на мобильном
  Safari (app-shell layout вместо fixed-позиционирования).
- **2026-08-20** — расширенная лексика: 35 английских слов (B2–C1) и 40
  казахских (A1–A2) по темам; склад новых карточек и система
  mastered/«уже знаю».
- **2026-08-20** — автодеплой через GitHub Actions при push в `master`;
  Caddy делит сервер с другими проектами через внешнюю docker-сеть.
