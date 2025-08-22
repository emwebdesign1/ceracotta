import { Router } from 'express';
import { verifyJWT, requireRole } from '../middleware/auth.js';
import { adminListOrders, adminListUsers, adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from '../controllers/admin.controller.js';
const r = Router();
r.use(verifyJWT, requireRole('ADMIN'));

// Produits CRUD
r.post('/products', adminCreateProduct);
r.patch('/products/:id', adminUpdateProduct);
r.delete('/products/:id', adminDeleteProduct);

// Lists
r.get('/orders', adminListOrders); // toutes commandes
r.get('/users', adminListUsers);

export default r;
