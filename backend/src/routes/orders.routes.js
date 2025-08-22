import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.js';
import { createIntent, confirmOrder, myOrders } from '../controllers/orders.controller.js';
const r = Router();
r.use(verifyJWT);
r.post('/intent', createIntent);     // Stripe PI (CARD ou TWINT via Stripe)
r.post('/confirm', confirmOrder);    // créer Order + décrément stock
r.get('/my', myOrders);
export default r;