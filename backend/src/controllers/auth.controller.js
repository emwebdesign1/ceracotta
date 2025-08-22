import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { hash, compare } from '../utils/passwords.js';
const prisma = new PrismaClient();

const signPair = (user) => {
  const payload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });
  return { accessToken, refreshToken };
};

export const registerCtrl = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, username } = req.body;
    const exists = await prisma.user.findUnique({ where:{ email }});
    if (exists) return next({ status:409, message:'Email déjà utilisé' });
    const user = await prisma.user.create({
      data: { email, passwordHash: await hash(password), firstName, lastName, username }
    });
    const tokens = signPair(user);
    res.status(201).json({ ...tokens, user: { id:user.id, email:user.email, role:user.role }});
  } catch (e) { next(e); }
};

export const loginCtrl = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where:{ email }});
    if (!user || !(await compare(password, user.passwordHash))) return next({ status:401, message:'Identifiants invalides' });
    const tokens = signPair(user);
    res.json({ ...tokens, user: { id:user.id, email:user.email, role:user.role }});
  } catch (e) { next(e); }
};

export const meCtrl = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub }});
  res.json({ user });
};

export const updateProfileCtrl = async (req, res, next) => {
  try {
    const { firstName, lastName, username, addressLine1, addressLine2, zip, city, country } = req.body;
    const user = await prisma.user.update({
      where:{ id: req.user.sub },
      data: { firstName, lastName, username, addressLine1, addressLine2, zip, city, country }
    });
    res.json({ user });
  } catch (e) { next(e); }
};
