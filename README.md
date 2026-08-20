# Langapp

Личное приложение для изучения казахского и английского языков через
карточки со spaced repetition (SM-2) и квизами.

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
│   ├── routes/       # cards, quiz, stats
│   ├── middleware/   # Basic Auth
│   ├── __tests__/    # unit-тесты (vitest)
│   └── seed.js       # ~15 стартовых карточек
├── client/           # React + Tailwind SPA
│   └── src/
│       ├── pages/        # Dashboard, Study, Quiz, Browse, AddCard, Login
│       ├── components/   # Layout, компоненты квизов
│       ├── api/          # обёртка над fetch с Basic Auth
│       └── context/      # AuthContext
├── data/             # SQLite-файл (app.db), не в git
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

`.github/workflows/deploy.yml` запускается при каждом push в `main`:
подключается по SSH к серверу и выполняет `git pull && docker compose
up -d --build`. Для работы нужно завести 3 секрета в **Settings →
Secrets and variables → Actions**:

- `DEPLOY_SSH_KEY` — приватный SSH-ключ для деплоя
- `SSH_HOST` — адрес сервера
- `SSH_USER` — пользователь на сервере

## API

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/cards/due` | карточки к повторению сегодня |
| GET | `/api/cards?theme=&language=` | список/фильтр карточек |
| POST | `/api/cards` | добавить карточку |
| PUT | `/api/cards/:id` | редактировать карточку |
| DELETE | `/api/cards/:id` | удалить карточку |
| POST | `/api/cards/:id/review` | отправить оценку (0–5), обновить SM-2 |
| GET | `/api/quiz?type=choice\|typing\|matching&theme=&language=&count=` | сгенерировать квиз |
| GET | `/api/stats` | статистика: всего карточек, к повторению, streak, по темам |

Все запросы требуют Basic Auth (логин/пароль из `.env`).
