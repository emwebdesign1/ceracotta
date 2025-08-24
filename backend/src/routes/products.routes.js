import { Router } from 'express';
import { list, bySlug } from '../controllers/products.controller.js'; // (ou le nom de ton fichier)

const r = Router();

// Liste paginée + filtres
r.get('/', list);

// Détail produit par slug
r.get('/:slug', bySlug);

export default r;
