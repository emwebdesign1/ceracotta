import { Router } from 'express';
import { registerCtrl, loginCtrl, meCtrl, updateProfileCtrl } from '../controllers/auth.controller.js';
import { verifyJWT } from '../middleware/auth.js';
const r = Router();
r.post('/register', registerCtrl);
r.post('/login', loginCtrl);
r.get('/me', verifyJWT, meCtrl);
r.patch('/me', verifyJWT, updateProfileCtrl); // prénom/nom/adresse/username
export default r;
