import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { basicAuth } from './middleware/basicAuth.js';
import { cardsRouter } from './routes/cards.js';
import { quizRouter } from './routes/quiz.js';
import { statsRouter } from './routes/stats.js';
import { sessionsRouter } from './routes/sessions.js';
import { theoryRouter } from './routes/theory.js';
import { theoryReferenceRouter } from './routes/theoryReference.js';
import { gamificationRouter } from './routes/gamification.js';
import { backlogRouter } from './routes/backlog.js';
import { startTelegramBot } from './telegram/bot.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const CLIENT_DIST = path.resolve(__dirname, '..', 'client', 'dist');

const app = express();
app.use(express.json());
app.use(basicAuth);

app.use('/api/cards', cardsRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/stats', statsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/theory', theoryRouter);
app.use('/api/theory', theoryReferenceRouter);
app.use('/api/gamification', gamificationRouter);
app.use('/api/backlog', backlogRouter);

app.use(express.static(CLIENT_DIST));
app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`langapp server listening on port ${PORT}`);
});

startTelegramBot();
