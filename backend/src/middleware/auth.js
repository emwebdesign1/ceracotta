import jwt from 'jsonwebtoken';
export const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.accessToken;
  if (!token) return res.status(401).json({ message:'Unauthorized' });
  try { req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET); next(); }
  catch { res.status(401).json({ message:'Invalid token' }); }
};
export const requireRole = (role) => (req, res, next) =>
  req.user?.role === role ? next() : res.status(403).json({ message:'Forbidden' });
