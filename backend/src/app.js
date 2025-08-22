// src/app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import routes from './routes/index.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

// __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crée l'app
const app = express();

// Middlewares globaux
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// === Servir le frontend (dossier /frontend à la racine du projet) ===
const FRONT_DIR = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(FRONT_DIR));
// Facultatif : forcer l'index quand on visite /
app.get('/', (_req, res) => res.sendFile(path.join(FRONT_DIR, 'index.html')));

// === API sous /api ===
// (index.routes.js doit déjà exposer /, /health et les sous-routes)
app.use('/api', routes);

// 404 JSON pour ce qui reste
app.use((req, res, next) => next({ status: 404, message: 'Not Found' }));

// Gestion d'erreurs centralisée
app.use(errorHandler);

export default app;
