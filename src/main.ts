import express from 'express';
import cors from 'cors';

import * as CONFIG from './lib/config';
import { GeniusApi } from './lib/genius';
import { Database } from './lib/database';

const db = new Database(CONFIG.MONGO_URL);
const genius = new GeniusApi(CONFIG.GENIUS_API, db);

const app = express();
app.use(cors());

app.get('/', async (req, res) => {
  const query = req.query.q as string;
  if (!query) return res.send('').end();
  try {
    const lyrics = await genius.getLyrics(query);
    return res.json({ status: 'ok', result: lyrics }).end();
  } catch (error) {
    console.log('error:', error);
    return res.json({ status: 'error', result: error.toString() }).end();
  }
});

app.listen(CONFIG.PORT, function () {
  console.log('Server up and running on ', `http://localhost:${CONFIG.PORT}/`);
});
