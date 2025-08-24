// src/middleware/auth.js
import jwt from 'jsonwebtoken';

const { JWT_SECRET = 'dev-secret' } = process.env;

// Vérifie le JWT et met l'utilisateur dans req.user
export function verifyJWT(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const [scheme, token] = auth.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Token manquant ou invalide' });
    }
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    next();
  } catch (_) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

// Vérifie le rôle (ex: requireRole('ADMIN'))
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user?.role) return res.status(401).json({ error: 'Non authentifié' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Accès refusé : rôle insuffisant' });
  next();
};

// ✅ Alias pour compatibilité avec tes anciennes routes
export const requireAuth = verifyJWT;
