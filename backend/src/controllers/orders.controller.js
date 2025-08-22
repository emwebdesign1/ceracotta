import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1) Créer un PaymentIntent Stripe en précisant la méthode (CARD ou TWINT)
export const createIntent = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body; // "CARD" | "TWINT"
    if (!['CARD','TWINT'].includes(paymentMethod)) return next({ status:400, message:'Méthode invalide' });

    const cart = await prisma.cart.findUnique({ where:{ userId: req.user.sub }, include:{ items:true }});
    if (!cart || !cart.items.length) return next({ status:400, message:'Panier vide' });

    const amount = cart.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const pi = await stripe.paymentIntents.create({
      amount, currency:'chf',
      automatic_payment_methods: { enabled: true }, // Stripe gérera la carte + twint si activé
      metadata:{ userId: req.user.sub, paymentMethod }
    });
    res.json({ clientSecret: pi.client_secret, amount });
  } catch (e) { next(e); }
};

// 2) Confirmer la commande après confirmation côté front (Stripe.js)
export const confirmOrder = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!pi) return next({ status:400, message:'PI introuvable' });
    if (!['succeeded','processing','requires_capture'].includes(pi.status))
      return next({ status:400, message:'Paiement non confirmé' });

    const method = (pi.metadata?.paymentMethod === 'TWINT') ? 'TWINT' : 'CARD';

    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({ where:{ userId: req.user.sub }, include:{ items:true }});
      if (!cart || !cart.items.length) throw { status:400, message:'Panier vide' };

      // Vérifier stock & décrémenter
      for (const it of cart.items) {
        const p = await tx.product.findUnique({ where:{ id: it.productId }});
        if (!p || p.stock < it.quantity) throw { status:409, message:`Stock insuffisant pour ${it.title}` };
        await tx.product.update({ where:{ id:p.id }, data:{ stock: p.stock - it.quantity }});
      }
      const amount = cart.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);

      const order = await tx.order.create({
        data:{
          userId: req.user.sub,
          amount, currency:'CHF',
          status: pi.status === 'succeeded' ? 'PAID' : 'PENDING',
          paymentMethod: method,
          paymentProvider: 'STRIPE',
          paymentIntentId, paymentStatus: pi.status,
          shippingAddress: {
            line1: req.body?.shipping?.line1 ?? null,
            line2: req.body?.shipping?.line2 ?? null,
            zip: req.body?.shipping?.zip ?? null,
            city: req.body?.shipping?.city ?? null,
            country: req.body?.shipping?.country ?? null
          },
          items:{ create: cart.items.map(it => ({
            productId: it.productId, title: it.title, unitPrice: it.unitPrice, quantity: it.quantity, image: it.image
          })) }
        },
        include:{ items:true }
      });

      await tx.cartItem.deleteMany({ where:{ cartId: cart.id }});
      return order;
    });

    res.status(201).json(order);
  } catch (e) { next(e); }
};

export const myOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where:{ userId: req.user.sub }, orderBy:{ createdAt:'desc' }, include:{ items:true }
    });
    res.json(orders);
  } catch (e) { next(e); }
};
