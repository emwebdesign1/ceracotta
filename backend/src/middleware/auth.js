// src/middleware/auth.js
import jwt from 'jsonwebtoken';

const { JWT_SECRET = 'dev-secret' } = process.env;

// Vérifie le JWT et expose l'id dans req.user / req.userId
export function verifyJWT(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const [scheme, token] = auth.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Token manquant ou invalide' });
    }
    const payload = jwt.verify(token, JWT_SECRET);
    // Normalise ce que lit le contrôleur
    req.user = { id: payload.id };
    req.userId = payload.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user?.role) return res.status(401).json({ error: 'Non authentifié' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Accès refusé : rôle insuffisant' });
  next();
};

// Alias compat
export const requireAuth = verifyJWT;
