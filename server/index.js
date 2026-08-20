import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { basicAuth } from './middleware/basicAuth.js';
import { cardsRouter } from './routes/cards.js';
import { quizRouter } from './routes/quiz.js';
import { statsRouter } from './routes/stats.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const CLIENT_DIST = path.resolve(__dirname, '..', 'client', 'dist');

const app = express();
app.use(express.json());
app.use(basicAuth);

app.use('/api/cards', cardsRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/stats', statsRouter);

app.use(express.static(CLIENT_DIST));
app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`langapp server listening on port ${PORT}`);
});
