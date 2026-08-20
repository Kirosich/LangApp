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
- Опциональная связка тема карточек ↔ slug темы справочника
  (`theory_theme_links`, `server/seed-theory-links.js`): на карточке в
  Study/Browse — ссылка «Теория» на связанную тему; на странице темы
  справочника — блок «Практика» (выучено/всего) и кнопка «Учить эти
  слова» с фильтром по теме

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
- **Деплой**: Docker + docker-compose, GitHub Actions; TLS и проксирование
  на хосте — системный nginx (общий для всех сайтов на сервере)

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
├── data/             # SQLite-файл (app.db), не в git
├── scripts/
│   └── backup-db.sh  # хостовый враппер для cron — ночной бэкап БД
├── Dockerfile        # multi-stage: сборка client -> прод-образ с API
├── docker-compose.yml
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
2. Запустите:

   ```bash
   docker compose up -d --build
   ```

   Сервис `app` соберёт client и поднимет Express на порту 3000 внутри
   контейнера, опубликованном на хосте только на `127.0.0.1:3001`
   (см. `docker-compose.override.yml`) — данные SQLite хранятся в `./data`,
   смонтированной volume.
3. TLS и публичный доступ по домену — через системный **nginx** на хосте
   (не в докере): для каждого сайта на сервере, включая langapp, у него
   свой vhost с сертификатом Let's Encrypt (certbot), который проксирует
   на `127.0.0.1:<порт контейнера>`. Заводить домен для langapp — значит
   добавить свой vhost-файл в `/etc/nginx/sites-available/`, как у
   остальных сайтов на машине; отдельный reverse-proxy контейнер (Caddy
   и т.п.) здесь не нужен и раньше конфликтовал за порты 80/443 с этим же
   nginx (см. «Обновления» ниже).

## Бэкапы БД

Ежедневно в 04:00 по времени сервера (cron пользователя `deploy` на
хосте) запускается `scripts/backup-db.sh` → внутри контейнера
`server/scripts/backup-db.js` снимает атомарный снапшот `data/app.db`
через `better-sqlite3`'s `.backup()` (SQLite Online Backup API — безопасно
на «горячую» базу, в отличие от простого `cp`), проверяет, что снимок
читается, и хранит последние 14 копий в `/home/deploy/backups/langapp/`
(вне репозитория и вне `data/`, на хосте).

Ручной запуск / восстановление:

```bash
./scripts/backup-db.sh                          # снять бэкап вручную
docker exec langapp-app-1 node -e "              # проверить снимок
  const Database = require('better-sqlite3');
  const db = new Database('/app/backups/app-2026-08-20.db', { readonly: true });
  console.log(db.prepare('SELECT COUNT(*) FROM cards').get());
"
# восстановление — остановить контейнер, подменить data/app.db файлом
# из /home/deploy/backups/langapp/, запустить контейнер снова
```

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
| GET | `/api/cards/due?language=&theme=` | карточки к повторению сегодня (SM-2), опционально по теме |
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
| GET | `/api/theory/theme-links?language=` | связки тема карточек ↔ slug темы справочника |
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
- **2026-08-20** — автодеплой через GitHub Actions при push в `master`.
- **2026-08-20** — убран Docker Caddy: он занимал хостовые порты 80/443
  и клал доступ ко всем остальным сайтам сервера. Системный nginx уже
  умеет всё нужное сам (свой vhost с Let's Encrypt для домена langapp,
  проксирует на `127.0.0.1:3001`) — Caddy оказался лишним и конфликтующим
  слоем, полностью убран из `docker-compose.yml`.
- **2026-08-20** — автоматические ночные бэкапы БД: `scripts/backup-db.sh`
  через cron (04:00 по времени сервера) вызывает `server/scripts/backup-db.js`
  внутри контейнера — атомарный снимок через `better-sqlite3`'s `.backup()`
  (тот же SQLite Online Backup API, что и CLI `.backup`), хранит последние
  14 снимков в `/home/deploy/backups/langapp/`, каждый раз проверяет, что
  бэкап реально читается.
- **2026-08-20** — склад пополнен на 300 карточек (Этап 2 плана): 150
  казахских (A1–A2: одежда, погода, дни недели и месяцы, глаголы движения,
  вопросительные слова, здоровье, покупки и деньги, качества) и 150
  английских (B2–C1: связки речи, устойчивые сочетания make/do/take/have,
  карьера, точные глаголы вместо общих, аргументация). Все — в `backlog`,
  вводятся дозированно; см. `server/seed-vocab-stage2-backlog.js`.
- **2026-08-20** — связка теории и карточек (Этап 3 плана): опциональная
  таблица `theory_theme_links` (тема ↔ slug темы справочника), ссылка
  «Теория» на карточках в Study/Browse и блок «Практика» (выучено/всего
  + «Учить эти слова» с фильтром по теме) на странице темы справочника.
  Пока связано 7 тем: `глаголы`/`глаголы движения` → времена глагола,
  `вопросительные слова` → вопросительные частицы, `семья` → аффиксы
  принадлежности, `покупки и деньги` → табыс септік; `карьера` → phrasal
  verbs про работу, `синонимы` → путаемые пары слов.
