import { PrismaClient, OrderStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";

const prisma = new PrismaClient();

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const fullPermissions = {
  "restaurant.read": true,
  "restaurant.update": true,
  "table.create": true,
  "table.read": true,
  "table.update": true,
  "table.delete": true,
  "menu.create": true,
  "menu.read": true,
  "menu.update": true,
  "menu.delete": true,
  "order.read": true,
  "order.update": true,
  "qrcode.create": true,
  "qrcode.read": true,
  "qrcode.delete": true,
  "analytics.read": true,
  "media.create": true,
  "media.read": true,
  "media.delete": true,
};

async function upsertUser(email: string, name: string, role: UserRole, restaurantId?: string) {
  const password = await bcrypt.hash("Demo@12345", 10);

  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      status: "active",
      restaurantId,
      password,
      emailVerified: new Date(),
    },
    create: {
      email,
      name,
      role,
      status: "active",
      restaurantId,
      password,
      emailVerified: new Date(),
    },
  });
}

async function main() {
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "demo-qresto-cafe" },
    update: {
      name: "Demo Qresto Cafe",
      description: "A fully loaded demo restaurant for QR ordering, table management, menus, and analytics.",
      address: "MG Road, Bengaluru, Karnataka",
      phone: "+91 98765 43210",
      email: "demo@qresto.local",
      status: "active",
      isActive: true,
      permissions: fullPermissions,
      customization: {
        primaryColor: "#0f766e",
        secondaryColor: "#f59e0b",
        fontFamily: "Inter",
        layout: "grid",
        showRatings: true,
        showPrepTime: true,
        columnsMobile: 1,
        columnsTablet: 2,
        columnsDesktop: 3,
      },
      logoUrl: "/main_logo.png",
      coverUrl: "/logo_Qresto.png",
    },
    create: {
      name: "Demo Qresto Cafe",
      slug: "demo-qresto-cafe",
      description: "A fully loaded demo restaurant for QR ordering, table management, menus, and analytics.",
      address: "MG Road, Bengaluru, Karnataka",
      phone: "+91 98765 43210",
      email: "demo@qresto.local",
      status: "active",
      isActive: true,
      permissions: fullPermissions,
      customization: {
        primaryColor: "#0f766e",
        secondaryColor: "#f59e0b",
        fontFamily: "Inter",
        layout: "grid",
        showRatings: true,
        showPrepTime: true,
        columnsMobile: 1,
        columnsTablet: 2,
        columnsDesktop: 3,
      },
      logoUrl: "/main_logo.png",
      coverUrl: "/logo_Qresto.png",
    },
  });

  await upsertUser("superadmin@qresto.local", "Qresto Super Admin", "SUPER_ADMIN");
  await upsertUser("admin@qresto.local", "Qresto Company Admin", "ADMIN");
  await upsertUser("owner@qresto.local", "Demo Restaurant Owner", "OWNER", restaurant.id);
  await upsertUser("staff@qresto.local", "Demo Floor Staff", "STAFF", restaurant.id);

  const categories = await Promise.all([
    prisma.menuCategory.upsert({
      where: { id: "demo-cat-breakfast" },
      update: { restaurantId: restaurant.id, name: "Breakfast", displayOrder: 1, isActive: true, status: "active" },
      create: {
        id: "demo-cat-breakfast",
        restaurantId: restaurant.id,
        name: "Breakfast",
        description: "Fresh morning plates and drinks.",
        displayOrder: 1,
        isActive: true,
        status: "active",
      },
    }),
    prisma.menuCategory.upsert({
      where: { id: "demo-cat-main-course" },
      update: { restaurantId: restaurant.id, name: "Main Course", displayOrder: 2, isActive: true, status: "active" },
      create: {
        id: "demo-cat-main-course",
        restaurantId: restaurant.id,
        name: "Main Course",
        description: "Customer favorites for lunch and dinner.",
        displayOrder: 2,
        isActive: true,
        status: "active",
      },
    }),
    prisma.menuCategory.upsert({
      where: { id: "demo-cat-beverages" },
      update: { restaurantId: restaurant.id, name: "Beverages", displayOrder: 3, isActive: true, status: "active" },
      create: {
        id: "demo-cat-beverages",
        restaurantId: restaurant.id,
        name: "Beverages",
        description: "Coffee, coolers, and house drinks.",
        displayOrder: 3,
        isActive: true,
        status: "active",
      },
    }),
  ]);

  const [breakfast, mainCourse, beverages] = categories;

  const menuItems = await Promise.all([
    prisma.menuItem.upsert({
      where: { id: "demo-item-masala-dosa" },
      update: {},
      create: {
        id: "demo-item-masala-dosa",
        restaurantId: restaurant.id,
        categoryId: breakfast.id,
        name: "Masala Dosa",
        description: "Crisp dosa with spiced potato, sambar, and chutneys.",
        price: 120,
        originalPrice: 150,
        discount: 20,
        isVegetarian: true,
        isPopular: true,
        rating: 4.8,
        prepTime: 12,
        spiceLevel: 2,
        displayOrder: 1,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "demo-item-paneer-tikka" },
      update: {},
      create: {
        id: "demo-item-paneer-tikka",
        restaurantId: restaurant.id,
        categoryId: mainCourse.id,
        name: "Paneer Tikka Bowl",
        description: "Smoky paneer, rice, salad, mint chutney, and pickled onions.",
        price: 260,
        isVegetarian: true,
        isChefSpecial: true,
        rating: 4.7,
        prepTime: 18,
        spiceLevel: 3,
        displayOrder: 1,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "demo-item-biryani" },
      update: {},
      create: {
        id: "demo-item-biryani",
        restaurantId: restaurant.id,
        categoryId: mainCourse.id,
        name: "Hyderabadi Veg Biryani",
        description: "Aromatic basmati rice layered with vegetables and spices.",
        price: 240,
        isVegetarian: true,
        isTrending: true,
        rating: 4.6,
        prepTime: 22,
        spiceLevel: 4,
        displayOrder: 2,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "demo-item-cold-coffee" },
      update: {},
      create: {
        id: "demo-item-cold-coffee",
        restaurantId: restaurant.id,
        categoryId: beverages.id,
        name: "Classic Cold Coffee",
        description: "Chilled coffee blended with milk and ice cream.",
        price: 140,
        isVegetarian: true,
        isNew: true,
        rating: 4.5,
        prepTime: 8,
        displayOrder: 1,
      },
    }),
  ]);

  const tableSpecs = [
    { number: "1", name: "Window Table", capacity: 2 },
    { number: "2", name: "Family Booth", capacity: 6 },
    { number: "3", name: "Center Table", capacity: 4 },
    { number: "4", name: "Patio Table", capacity: 4 },
    { number: "5", name: "Private Corner", capacity: 8 },
    { number: "6", name: "Quick Bite", capacity: 2 },
  ];

  const tables = [];
  for (const spec of tableSpecs) {
    const table = await prisma.table.upsert({
      where: { restaurantId_number: { restaurantId: restaurant.id, number: spec.number } },
      update: {
        name: spec.name,
        capacity: spec.capacity,
        isActive: true,
        onlyCapacity: true,
      },
      create: {
        restaurantId: restaurant.id,
        number: spec.number,
        name: spec.name,
        capacity: spec.capacity,
        isActive: true,
        onlyCapacity: true,
      },
    });
    tables.push(table);

    const shortCode = `DEMO-${spec.number}`;
    const qrUrl = `${appUrl}/q/${shortCode}`;
    const dataUrl = await QRCode.toDataURL(qrUrl);
    await prisma.qRCode.upsert({
      where: { shortCode },
      update: {
        tableId: table.id,
        restaurantId: restaurant.id,
        dataUrl,
        isActive: true,
      },
      create: {
        shortCode,
        dataUrl,
        tableId: table.id,
        restaurantId: restaurant.id,
        isActive: true,
      },
    });
  }

  const orderData = [
    {
      orderNumber: "DEMO-ORD-1001",
      tableId: tables[0].id,
      status: OrderStatus.SERVED,
      customerName: "Aarav Sharma",
      customerPhone: "+91 90000 00001",
      items: [
        { menuItem: menuItems[0], quantity: 2 },
        { menuItem: menuItems[3], quantity: 2 },
      ],
    },
    {
      orderNumber: "DEMO-ORD-1002",
      tableId: tables[2].id,
      status: OrderStatus.PREPARING,
      customerName: "Priya Nair",
      customerPhone: "+91 90000 00002",
      items: [
        { menuItem: menuItems[1], quantity: 1 },
        { menuItem: menuItems[2], quantity: 1 },
      ],
    },
    {
      orderNumber: "DEMO-ORD-1003",
      tableId: tables[4].id,
      status: OrderStatus.READY,
      customerName: "Rahul Mehta",
      customerPhone: "+91 90000 00003",
      items: [
        { menuItem: menuItems[2], quantity: 3 },
        { menuItem: menuItems[3], quantity: 3 },
      ],
    },
  ];

  for (const order of orderData) {
    const totalAmount = order.items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
    await prisma.order.upsert({
      where: { orderNumber: order.orderNumber },
      update: {
        status: order.status,
        totalAmount,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        tableId: order.tableId,
        restaurantId: restaurant.id,
      },
      create: {
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        tableId: order.tableId,
        restaurantId: restaurant.id,
        items: {
          create: order.items.map((item) => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
            price: item.menuItem.price,
          })),
        },
      },
    });
  }

  await Promise.all([
    prisma.companyPage.upsert({
      where: { type: "about" },
      update: {
        title: "About Qresto",
        content: "Qresto helps restaurants run QR menus, table ordering, and order operations from one dashboard.",
        isPublished: true,
      },
      create: {
        type: "about",
        title: "About Qresto",
        content: "Qresto helps restaurants run QR menus, table ordering, and order operations from one dashboard.",
        isPublished: true,
      },
    }),
    prisma.companyPage.upsert({
      where: { type: "contact" },
      update: {
        title: "Contact Qresto",
        content: "Reach the Qresto team for onboarding, support, and restaurant setup help.",
        isPublished: true,
      },
      create: {
        type: "contact",
        title: "Contact Qresto",
        content: "Reach the Qresto team for onboarding, support, and restaurant setup help.",
        isPublished: true,
      },
    }),
    prisma.document.upsert({
      where: { restaurantId_slug: { restaurantId: restaurant.id, slug: "demo-welcome" } },
      update: {
        title: "Welcome Note",
        content: "Welcome to Demo Qresto Cafe. Scan a table QR code, browse the menu, and place a sample order.",
        type: "about",
        isPublished: true,
      },
      create: {
        restaurantId: restaurant.id,
        slug: "demo-welcome",
        title: "Welcome Note",
        content: "Welcome to Demo Qresto Cafe. Scan a table QR code, browse the menu, and place a sample order.",
        type: "about",
        isPublished: true,
      },
    }),
  ]);

  await prisma.contactSubmission.upsert({
    where: { id: "demo-contact-submission" },
    update: {
      status: "pending",
      subject: "Demo onboarding inquiry",
      message: "I would like to try QR ordering for my restaurant.",
    },
    create: {
      id: "demo-contact-submission",
      name: "Demo Prospect",
      email: "prospect@qresto.local",
      phone: "+91 90000 00004",
      company: "Demo Foods Pvt Ltd",
      subject: "Demo onboarding inquiry",
      message: "I would like to try QR ordering for my restaurant.",
      status: "pending",
    },
  });

  await prisma.media.upsert({
    where: { id: "demo-media-logo" },
    update: {
      restaurantId: restaurant.id,
      filename: "main_logo.png",
      url: "/main_logo.png",
      mimeType: "image/png",
      size: 1024,
      type: "image",
      category: "logo",
    },
    create: {
      id: "demo-media-logo",
      restaurantId: restaurant.id,
      filename: "main_logo.png",
      url: "/main_logo.png",
      mimeType: "image/png",
      size: 1024,
      type: "image",
      category: "logo",
    },
  });

  console.log("Demo data added:");
  console.log(`Restaurant: ${restaurant.name} (${restaurant.slug})`);
  console.log("Users: superadmin@qresto.local, admin@qresto.local, owner@qresto.local, staff@qresto.local");
  console.log("Password for all demo users: Demo@12345");
  console.log("QR short codes: DEMO-1 through DEMO-6");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
