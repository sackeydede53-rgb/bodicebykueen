import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { getLibSqlConfig } from "../src/lib/libsql";

const adapter = new PrismaLibSql(getLibSqlConfig());
const prisma = new PrismaClient({ adapter });

async function upsertCategory(
  slug: string,
  name: string,
  description: string,
) {
  return prisma.category.upsert({
    where: { slug },
    update: { name, description },
    create: { slug, name, description },
  });
}

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@bodicebykueen.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Bodice Admin";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name },
  });

  // Remove old demo products that no longer match the catalogue
  const obsoleteSlugs = [
    "noir-column-dress",
    "champagne-drape-set",
    "ivory-structured-bodice",
    "midnight-slip-dress",
  ];
  await prisma.product.deleteMany({
    where: { slug: { in: obsoleteSlugs } },
  });
  await prisma.category.deleteMany({
    where: { slug: { in: ["dresses", "sets", "tops"] } },
  });

  const basicTops = await upsertCategory(
    "basic-tops",
    "Basic Tops",
    "Everyday elevated basics — clean, versatile, ready to wear",
  );
  const novaTops = await upsertCategory(
    "nova-tops",
    "Nova Tops",
    "Signature Nova tops with sculpted presence",
  );
  const rhinestone = await upsertCategory(
    "rhinestone-cowl-neck-tops",
    "Rhinestone Cowl Neck Tops",
    "Statement cowl necks with rhinestone detail",
  );
  const bodysuits = await upsertCategory(
    "bodysuits",
    "Bodysuits",
    "Form-fitting bodysuits for day to night",
  );
  const tubeTops = await upsertCategory(
    "tube-tops",
    "Tube Tops",
    "Clean tube tops in soft stretch fabrics",
  );
  const preorder = await upsertCategory(
    "preorder",
    "Pre-order",
    "Special-order pieces — we source a wide range of styles on request",
  );

  await prisma.promoCode.upsert({
    where: { code: "KUEEN10" },
    update: { active: true, discountValue: 10 },
    create: {
      code: "KUEEN10",
      discountType: "PERCENT",
      discountValue: 10,
      active: true,
    },
  });

  const products = [
    {
      name: "Essential Basic Top",
      slug: "essential-basic-top",
      description:
        "A clean, elevated basic top for everyday wear. Soft stretch, flattering cut, easy to style with jeans or skirts.",
      price: 180,
      categoryId: basicTops.id,
      availability: "AVAILABLE" as const,
      featured: true,
      image: "/uploads/basic-top.jpg",
      stock: 12,
    },
    {
      name: "Nova Contour Top",
      slug: "nova-contour-top",
      description:
        "The signature Nova top — sculpted seams and a confident silhouette. Made for nights out and special moments.",
      price: 260,
      categoryId: novaTops.id,
      availability: "AVAILABLE" as const,
      featured: true,
      image: "/uploads/nova-top.jpg",
      stock: 8,
    },
    {
      name: "Rhinestone Cowl Neck Top",
      slug: "rhinestone-cowl-neck-top",
      description:
        "A glamorous cowl neck topped with rhinestone detail. Statement sparkle with a soft drape.",
      price: 320,
      categoryId: rhinestone.id,
      availability: "IN_STOCK" as const,
      featured: true,
      image: "/uploads/rhinestone-cowl.jpg",
      stock: 6,
    },
    {
      name: "Sculpt Bodysuit",
      slug: "sculpt-bodysuit",
      description:
        "A form-fitting bodysuit with snap closure and soft stretch. Wear alone or layered under skirts and trousers.",
      price: 240,
      categoryId: bodysuits.id,
      availability: "AVAILABLE" as const,
      featured: true,
      image: "/uploads/bodysuit.jpg",
      stock: 10,
    },
    {
      name: "Soft Tube Top",
      slug: "soft-tube-top",
      description:
        "A clean tube top in soft stretch fabric. Minimal, flattering, and easy to dress up or down.",
      price: 150,
      categoryId: tubeTops.id,
      availability: "AVAILABLE" as const,
      featured: true,
      image: "/uploads/tube-top.jpg",
      stock: 14,
    },
    {
      name: "Custom Pre-order Piece",
      slug: "custom-preorder-piece",
      description:
        "Pre-order from our wider catalogue — dresses, sets, occasion looks, and more. Tell us what you want in the order notes and we will source it for you.",
      price: 450,
      categoryId: preorder.id,
      availability: "PREORDER" as const,
      preorderEta: "Ships after sourcing · ETA confirmed after order",
      featured: true,
      image: "/uploads/preorder.jpg",
      stock: 0,
    },
    {
      name: "Occasion Pre-order Look",
      slug: "occasion-preorder-look",
      description:
        "Request a special-occasion look through pre-order. We work with a vast range of styles beyond our ready-to-wear tops.",
      price: 580,
      categoryId: preorder.id,
      availability: "PREORDER" as const,
      preorderEta: "Ships when your piece is ready",
      featured: false,
      image: "/uploads/preorder-occasion.jpg",
      stock: 0,
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findUnique({
      where: { slug: p.slug },
    });

    if (existing) {
      await prisma.product.update({
        where: { slug: p.slug },
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          categoryId: p.categoryId,
          availability: p.availability,
          preorderEta: p.preorderEta ?? null,
          featured: p.featured,
          published: true,
        },
      });
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
      await prisma.productImage.create({
        data: {
          productId: existing.id,
          url: p.image,
          alt: p.name,
          sortOrder: 0,
        },
      });
      continue;
    }

    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        categoryId: p.categoryId,
        availability: p.availability,
        preorderEta: p.preorderEta ?? null,
        featured: p.featured,
        published: true,
        images: {
          create: [{ url: p.image, alt: p.name, sortOrder: 0 }],
        },
        variants: {
          create: ["XS", "S", "M", "L", "XL"].map((size) => ({
            size,
            color: "Black",
            stock: p.stock,
          })),
        },
      },
    });
  }

  console.log("Seed complete — Bodice catalogue:");
  console.log("Ready: Basic Tops, Nova Tops, Rhinestone Cowl Neck Tops, Bodysuits, Tube Tops");
  console.log("Pre-order: wide-range special orders");
  console.log(`Admin: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
