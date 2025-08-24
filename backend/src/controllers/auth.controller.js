// src/controllers/auth.controller.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/db.js';

const { JWT_SECRET = 'dev-secret', JWT_EXPIRES_IN = '7d' } = process.env;

/* ===== Schemas de validation ===== */
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Mot de passe: min 8 caractères'),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

/* ===== Helpers ===== */
function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/* ===== Controllers ===== */
export async function register(req, res) {
  try {
    const data = registerSchema.parse(req.body);

    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null
        // role par défaut = CUSTOMER (défini dans Prisma)
      },
      select: { id: true, email: true, role: true }
    });

    const token = signToken(user);
    return res.status(201).json({ token, user });
  } catch (err) {
    if (err?.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation', details: err.errors });
    }
    console.error('register error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });

    const safeUser = { id: user.id, email: user.email, role: user.role };
    const token = signToken(safeUser);
    return res.json({ token, user: safeUser });
  } catch (err) {
    if (err?.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation', details: err.errors });
    }
    console.error('login error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function me(req, res) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Non authentifié' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, firstName: true, lastName: true }
    });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    return res.json({ user });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
