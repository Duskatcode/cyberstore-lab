import {
  PrismaClient,
  ProductStatus,
  ProductType,
  UserRoleName,
  UserStatus,
} from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const PASSWORD = 'CyberStore123!';

async function main() {
  console.log('🌱 Starting CyberStore Lab seed...');

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  const adminRole = await prisma.role.upsert({
    where: { name: UserRoleName.admin },
    update: {},
    create: { name: UserRoleName.admin },
  });

  const sellerRole = await prisma.role.upsert({
    where: { name: UserRoleName.seller },
    update: {},
    create: { name: UserRoleName.seller },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: UserRoleName.customer },
    update: {},
    create: { name: UserRoleName.customer },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cyberstore.lab' },
    update: {},
    create: {
      email: 'admin@cyberstore.lab',
      passwordHash,
      name: 'CyberStore Admin',
      status: UserStatus.active,
      roleId: adminRole.id,
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@cyberstore.lab' },
    update: {},
    create: {
      email: 'seller@cyberstore.lab',
      passwordHash,
      name: 'CoreLab Seller',
      status: UserStatus.active,
      roleId: sellerRole.id,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@cyberstore.lab' },
    update: {},
    create: {
      email: 'customer@cyberstore.lab',
      passwordHash,
      name: 'CyberStore Customer',
      status: UserStatus.active,
      roleId: customerRole.id,
    },
  });

  const hardware = await prisma.category.upsert({
    where: { slug: 'hardware' },
    update: {},
    create: {
      name: 'Hardware',
      slug: 'hardware',
      description: 'Equipos, memoria, almacenamiento y componentes físicos para laboratorio.',
    },
  });

  const networking = await prisma.category.upsert({
    where: { slug: 'networking' },
    update: {},
    create: {
      name: 'Networking',
      slug: 'networking',
      description: 'Adaptadores, routers, switches y accesorios de red.',
    },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Herramientas, cables y periféricos para laboratorio técnico.',
    },
  });

  const digital = await prisma.category.upsert({
    where: { slug: 'digital' },
    update: {},
    create: {
      name: 'Digital',
      slug: 'digital',
      description: 'Guías, checklists y recursos digitales para aprendizaje.',
    },
  });

  await prisma.product.upsert({
    where: { slug: 'mini-pc-corelab' },
    update: {},
    create: {
      sellerId: seller.id,
      categoryId: hardware.id,
      name: 'Mini PC CoreLab',
      slug: 'mini-pc-corelab',
      description: 'Mini PC para laboratorio local, virtualización ligera y servicios internos.',
      type: ProductType.physical,
      status: ProductStatus.active,
      priceCents: 80000000,
      currency: 'COP',
      stock: 8,
      imageUrl: '/assets/products/hardware/mini-pc-corelab/cover.webp',
    },
  });

  await prisma.product.upsert({
    where: { slug: 'ssd-safestore-480gb' },
    update: {},
    create: {
      sellerId: seller.id,
      categoryId: hardware.id,
      name: 'SSD SafeStore 480GB',
      slug: 'ssd-safestore-480gb',
      description: 'Unidad SSD para acelerar servidores de laboratorio y estaciones de trabajo.',
      type: ProductType.physical,
      status: ProductStatus.active,
      priceCents: 16000000,
      currency: 'COP',
      stock: 15,
      imageUrl: '/assets/products/hardware/ssd-safestore-480gb/cover.webp',
    },
  });

  await prisma.product.upsert({
    where: { slug: 'wifi-adapter-netprobe' },
    update: {},
    create: {
      sellerId: seller.id,
      categoryId: networking.id,
      name: 'WiFi Adapter NetProbe',
      slug: 'wifi-adapter-netprobe',
      description: 'Adaptador WiFi para pruebas controladas de conectividad en laboratorio.',
      type: ProductType.physical,
      status: ProductStatus.active,
      priceCents: 9500000,
      currency: 'COP',
      stock: 12,
      imageUrl: '/assets/products/networking/wifi-adapter-netprobe/cover.webp',
    },
  });

  await prisma.product.upsert({
    where: { slug: 'ethernet-cat6-pro' },
    update: {},
    create: {
      sellerId: seller.id,
      categoryId: accessories.id,
      name: 'Ethernet CAT6 Pro',
      slug: 'ethernet-cat6-pro',
      description: 'Cable Ethernet CAT6 para conectar equipos del laboratorio local.',
      type: ProductType.physical,
      status: ProductStatus.active,
      priceCents: 2500000,
      currency: 'COP',
      stock: 30,
      imageUrl: '/assets/products/accessories/ethernet-cat6-pro/cover.webp',
    },
  });

  await prisma.product.upsert({
    where: { slug: 'owasp-checklist' },
    update: {},
    create: {
      sellerId: seller.id,
      categoryId: digital.id,
      name: 'OWASP Checklist',
      slug: 'owasp-checklist',
      description: 'Checklist digital para revisar controles básicos de seguridad web.',
      type: ProductType.digital,
      status: ProductStatus.active,
      priceCents: 0,
      currency: 'COP',
      stock: 999,
      imageUrl: '/assets/products/digital/owasp-checklist/cover.webp',
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: 'user_created',
      entity: 'seed',
      entityId: 'initial-seed',
      metadata: {
        users: [admin.email, seller.email, customer.email],
        defaultPassword: PASSWORD,
        note: 'Development seed only. Change credentials outside local lab.',
      },
    },
  });

  console.log('✅ Seed completed');
  console.log('');
  console.log('Initial users:');
  console.log(`- admin@cyberstore.lab / ${PASSWORD}`);
  console.log(`- seller@cyberstore.lab / ${PASSWORD}`);
  console.log(`- customer@cyberstore.lab / ${PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('❌ Seed failed');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
