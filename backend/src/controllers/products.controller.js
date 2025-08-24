import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const list = async (req, res, next) => {
  try {
    const { q, category, sort='-createdAt', page=1, limit=12 } = req.query;

    const orderBy = sort.startsWith('-')
      ? { [sort.slice(1)]: 'desc' }
      : { [sort]: 'asc' };

    const where = {
      AND: [
        { active: true },
        q ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } }
          ]
        } : {},
        category ? { category: { is: { slug: category } } } : {}
      ]
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: { category: true }
      }),
      prisma.product.count({ where })
    ]);

    res.json({ items, total });
  } catch (e) { next(e); }
};

export const bySlug = async (req, res, next) => {
  try {
    const p = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { category: true }
    });
    if (!p || !p.active) return next({ status: 404, message: 'Produit introuvable' });
    res.json(p); // <-- tu renvoies le produit directement (pas { product })
  } catch (e) { next(e); }
};
