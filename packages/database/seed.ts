import { prisma } from "./client.js";

async function main() {
  console.log("🌱 Starting seed for Aaloo local database...");

  // 1. Clean existing data in reverse order of dependencies
  await prisma.kotDailySequence.deleteMany();
  await prisma.kot.deleteMany();
  await prisma.billItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.billNumberSequence.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.tableSession.deleteMany();
  await prisma.itemAddonGroup.deleteMany();
  await prisma.addon.deleteMany();
  await prisma.addonGroup.deleteMany();
  await prisma.itemVariant.deleteMany();
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.table.deleteMany();
  await prisma.shopUser.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned old database entries.");

  // 2. Create Owner User
  // Password is 'password123'
  const owner = await prisma.user.create({
    data: {
      email: "owner@aloo.com",
      name: "Gautam Chouhan",
      password: "$2b$10$fXRoY5M/Eqlm8Qr5RgQsj.qk.moyVVy66FDpagDi8NT/0kaZ8nTmy",
    },
  });
  console.log(`👤 Created Owner: ${owner.name} (${owner.email})`);

  // 3. Create Shop
  const shop = await prisma.shop.create({
    data: {
      name: "Aaloo Cafe",
      address: "100ft Road, Indiranagar, Bangalore",
      gstNumber: "29ABCDE1234F1Z5",
      cgstRate: 250, // 2.5%
      sgstRate: 250, // 2.5%
      serviceChargeRate: 500, // 5.0%
      storefrontTheme: "classic",
    },
  });
  console.log(`🏪 Created Shop: ${shop.name} (ID: ${shop.id})`);

  // 4. Link Owner to Shop
  await prisma.shopUser.create({
    data: {
      userId: owner.id,
      shopId: shop.id,
      role: "OWNER",
    },
  });

  // 5. Create Tables (1 through 8)
  const tables = [];
  for (let i = 1; i <= 8; i++) {
    const table = await prisma.table.create({
      data: {
        shopId: shop.id,
        tableNumber: i,
      },
    });
    tables.push(table);
  }
  console.log(`🪑 Created 8 Tables for ${shop.name}`);

  // 6. Create Menu
  const menu = await prisma.menu.create({
    data: {
      shopId: shop.id,
    },
  });

  // 7. Create Addon Group
  const pizzaAddonGroup = await prisma.addonGroup.create({
    data: {
      shopId: shop.id,
      name: "Extra Toppings",
      minSelect: 0,
      maxSelect: 3,
      addons: {
        create: [
          { name: "Extra Mozzarella", price: 5000, sortOrder: 1 },
          { name: "Black Olives", price: 3000, sortOrder: 2 },
          { name: "Jalapenos", price: 3000, sortOrder: 3 },
          { name: "Mushroom", price: 4000, sortOrder: 4 },
        ],
      },
    },
  });

  // 8. Categories and Items
  interface MenuItemSeed {
    name: string;
    price: number;
    isVeg: boolean;
    variants?: { name: string; price: number; sortOrder: number }[];
    hasAddons?: boolean;
  }

  interface CategorySeed {
    name: string;
    orderIndex: number;
    items: MenuItemSeed[];
  }

  const menuCategories: CategorySeed[] = [
    {
      name: "Starters",
      orderIndex: 1,
      items: [
        { name: "Paneer Tikka", price: 22000, isVeg: true },
        { name: "Crispy Chilli Baby Corn", price: 18000, isVeg: true },
        { name: "Peri Peri French Fries", price: 12000, isVeg: true },
        { name: "Honey Chilli Potato", price: 14000, isVeg: true },
      ],
    },
    {
      name: "Pizzas",
      orderIndex: 2,
      items: [
        {
          name: "Margherita Pizza",
          price: 25000,
          isVeg: true,
          variants: [
            { name: "Regular (7 inch)", price: 25000, sortOrder: 1 },
            { name: "Medium (10 inch)", price: 38000, sortOrder: 2 },
            { name: "Large (12 inch)", price: 52000, sortOrder: 3 },
          ],
          hasAddons: true,
        },
        {
          name: "Farmhouse Veggie Pizza",
          price: 29000,
          isVeg: true,
          variants: [
            { name: "Regular (7 inch)", price: 29000, sortOrder: 1 },
            { name: "Medium (10 inch)", price: 44000, sortOrder: 2 },
            { name: "Large (12 inch)", price: 59000, sortOrder: 3 },
          ],
          hasAddons: true,
        },
      ],
    },
    {
      name: "Momos",
      orderIndex: 3,
      items: [
        { name: "Steamed Veg Momos (6 pcs)", price: 11000, isVeg: true },
        { name: "Fried Schezwan Momos", price: 13000, isVeg: true },
        { name: "Kurkure Paneer Momos", price: 16000, isVeg: true },
      ],
    },
    {
      name: "Mains & Biryani",
      orderIndex: 4,
      items: [
        { name: "Paneer Butter Masala", price: 24000, isVeg: true },
        { name: "Dal Makhani", price: 19000, isVeg: true },
        { name: "Butter Naan", price: 4500, isVeg: true },
        { name: "Dum Veg Biryani", price: 26000, isVeg: true },
        { name: "Jeera Rice", price: 12000, isVeg: true },
      ],
    },
    {
      name: "Beverages",
      orderIndex: 5,
      items: [
        { name: "Classic Cold Coffee", price: 12000, isVeg: true },
        { name: "Fresh Mint Lemonade", price: 8000, isVeg: true },
        { name: "Masala Chai", price: 4000, isVeg: true },
        { name: "Chocolate Brownie Shake", price: 16000, isVeg: true },
      ],
    },
  ];

  let sampleItem1 = null;
  let sampleItem2 = null;

  for (const cat of menuCategories) {
    const category = await prisma.category.create({
      data: {
        menuId: menu.id,
        name: cat.name,
        orderIndex: cat.orderIndex,
      },
    });

    for (const itemData of cat.items) {
      const item = await prisma.item.create({
        data: {
          shopId: shop.id,
          categoryId: category.id,
          name: itemData.name,
          price: itemData.price,
          isVeg: itemData.isVeg,
          isAvailable: true,
          variants: itemData.variants
            ? {
                create: itemData.variants,
              }
            : undefined,
        },
      });

      if (itemData.hasAddons) {
        await prisma.itemAddonGroup.create({
          data: {
            itemId: item.id,
            addonGroupId: pizzaAddonGroup.id,
          },
        });
      }

      if (!sampleItem1) sampleItem1 = item;
      else if (!sampleItem2) sampleItem2 = item;
    }
  }
  console.log(`📋 Seeded full menu with categories, items, variants, and add-ons.`);

  // 9. Create Active Session on Table 1 for live demo
  const table1 = tables[0]!;
  const session = await prisma.tableSession.create({
    data: {
      shopId: shop.id,
      tableId: table1.id,
      pax: 2,
    },
  });

  // 10. Create an active order in PREPARING status
  if (sampleItem1 && sampleItem2) {
    const orderTotal = sampleItem1.price + sampleItem2.price * 2;
    const order = await prisma.order.create({
      data: {
        shopId: shop.id,
        tableSessionId: session.id,
        totalAmount: orderTotal,
        status: "PREPARING",
        orderType: "DINE_IN",
        orderItems: {
          create: [
            {
              itemId: sampleItem1.id,
              name: sampleItem1.name,
              price: sampleItem1.price,
              quantity: 1,
            },
            {
              itemId: sampleItem2.id,
              name: sampleItem2.name,
              price: sampleItem2.price,
              quantity: 2,
            },
          ],
        },
      },
      include: {
        orderItems: true,
      },
    });

    // 11. Create a Kitchen Order Ticket (KOT #1)
    await prisma.kotDailySequence.create({
      data: {
        shopId: shop.id,
        dailyKey: "2026-09-29",
        lastNumber: 1,
      },
    });

    await prisma.kot.create({
      data: {
        shopId: shop.id,
        orderId: order.id,
        kotNumber: 1,
        dailyKey: "2026-09-29",
        isSupplementary: false,
        items: order.orderItems.map((oi) => ({
          orderItemId: oi.id,
          name: oi.name,
          quantity: oi.quantity,
        })),
      },
    });
    console.log(`🍽️ Created active Table 1 Session with Order and KOT #1.`);
  }

  console.log("\n==================================================");
  console.log("🎉 Local Aaloo Database Seeded Successfully!");
  console.log("==================================================");
  console.log(`🏪 Shop ID:       ${shop.id}`);
  console.log(`🏬 Shop Name:     ${shop.name}`);
  console.log(`👤 Owner Email:   owner@aloo.com`);
  console.log(`🔑 Owner Pass:    password123`);
  console.log(`📱 Storefront:    http://localhost:5001/shop/${shop.id}`);
  console.log(`🪑 Table 1 QR:    http://localhost:5001/shop/${shop.id}?table=1`);
  console.log(`🖥️ Dashboard:     http://localhost:5000/dashboard/${shop.id}`);
  console.log("==================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
