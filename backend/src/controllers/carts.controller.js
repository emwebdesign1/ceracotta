import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const ensureCart = (userId) => prisma.cart.upsert({ where:{ userId }, update:{}, create:{ userId }});

export const myCart = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where:{ userId: req.user.sub }, include:{ items:true }});
    res.json(cart || { items: [] });
  } catch (e) { next(e); }
};

export const addItem = async (req, res, next) => {
  try {
    const { productId, quantity=1, image } = req.body;
    const product = await prisma.product.findUnique({ where:{ id: productId }});
    if (!product) return next({ status:400, message:'Produit invalide' });
    const cart = await ensureCart(req.user.sub);
    const existing = await prisma.cartItem.findFirst({ where:{ cartId: cart.id, productId }});
    if (existing) {
      await prisma.cartItem.update({ where:{ id: existing.id }, data:{ quantity: existing.quantity + Number(quantity) }});
    } else {
      await prisma.cartItem.create({
        data:{
          cartId: cart.id, productId, title: product.title, unitPrice: product.price,
          quantity: Number(quantity), image: image || (Array.isArray(product.images)?product.images[0]:null)
        }
      });
    }
    const updated = await prisma.cart.findUnique({ where:{ id: cart.id }, include:{ items:true }});
    res.status(201).json(updated);
  } catch (e) { next(e); }
};

export const updateQty = async (req, res, next) => {
  try {
    const { itemId, quantity } = req.body;
    await prisma.cartItem.update({ where:{ id: itemId }, data:{ quantity: Math.max(1, Number(quantity)) }});
    const cart = await prisma.cart.findUnique({ where:{ userId: req.user.sub }, include:{ items:true }});
    res.json(cart);
  } catch (e) { next(e); }
};

export const removeItem = async (req, res, next) => {
  try {
    await prisma.cartItem.delete({ where:{ id: req.params.id }});
    const cart = await prisma.cart.findUnique({ where:{ userId: req.user.sub }, include:{ items:true }});
    res.json(cart);
  } catch (e) { next(e); }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where:{ userId: req.user.sub }});
    if (cart) await prisma.cartItem.deleteMany({ where:{ cartId: cart.id }});
    res.json({ ok:true });
  } catch (e) { next(e); }
};
