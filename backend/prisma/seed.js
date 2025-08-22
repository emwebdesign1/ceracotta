import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Catégories
  const vaisselle = await prisma.category.upsert({
    where: { slug: 'vaisselle' },
    update: {},
    create: { name: 'Vaisselle', slug: 'vaisselle' },
  })

  const vases = await prisma.category.upsert({
    where: { slug: 'vases' },
    update: {},
    create: { name: 'Vases', slug: 'vases' },
  })

  // Produits (2 vaisselles + 2 vases)
  await prisma.product.createMany({
    data: [
      {
        title: 'Assiette Céramique Blanche',
        slug: 'assiette-ceramique-blanche',
        description: 'Assiette artisanale en céramique blanche.',
        price: 2500, // 25 CHF
        stock: 10,
        categoryId: vaisselle.id,
        images: JSON.stringify(["/images/bols.png"]),
      },
      {
        title: 'Bol Céramique Émaillé',
        slug: 'bol-ceramique-emaille',
        description: 'Bol en céramique émaillée, parfait pour les soupes.',
        price: 1800, // 18 CHF
        stock: 15,
        categoryId: vaisselle.id,
        images: JSON.stringify(["/images/bols.png"]),
      },
      {
        title: 'Vase Minimaliste Noir',
        slug: 'vase-minimaliste-noir',
        description: 'Vase moderne noir mat, style minimaliste.',
        price: 4500, // 45 CHF
        stock: 5,
        categoryId: vases.id,
        images: JSON.stringify(["/images/bols.png"]),
      },
      {
        title: 'Vase Blanc Épuré',
        slug: 'vase-blanc-epure',
        description: 'Vase blanc épuré, idéal pour les bouquets modernes.',
        price: 3900, // 39 CHF
        stock: 7,
        categoryId: vases.id,
        images: JSON.stringify(["/images/bols.png"]),
      },
    ],
  })
}

main()
  .then(async () => {
    console.log("✅ Données insérées")
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
