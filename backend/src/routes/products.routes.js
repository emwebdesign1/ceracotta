import { Router } from 'express';
import { list, bySlug } from '../controllers/products.controller.js';
const r = Router();
r.get('/', list);          // ?category=vaisselle|vases&q=&sort=price|-createdAt&page=&limit=
r.get('/:slug', bySlug);
export default r;
