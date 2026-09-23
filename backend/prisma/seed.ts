import { PrismaClient, Role, ProductStatus, Priority, Visibility, MemberPermission, OrderStatus, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { electronicsProducts } from './seedData/electronicsData';
import { mobileAccessoriesProducts } from './seedData/mobileAccessoriesData';
import { mensClothingProducts } from './seedData/mensClothingData';
import { womensClothingProducts } from './seedData/womensClothingData';
import { footwearProducts } from './seedData/footwearData';
import { fashionAccessoriesProducts } from './seedData/fashionAccessoriesData';
import { jewelleryProducts } from './seedData/jewelleryData';
import { beautyProducts } from './seedData/beautyData';
import { homeFurnitureProducts } from './seedData/homeFurnitureData';
import { kitchenAppliancesProducts } from './seedData/kitchenAppliancesData';
import { homeAppliancesProducts } from './seedData/homeAppliancesData';
import { sportsFitnessProducts } from './seedData/sportsFitnessData';
import { booksStationeryProducts } from './seedData/booksStationeryData';
import { toysGamesProducts } from './seedData/toysGamesData';
import { babyProductsData } from './seedData/babyProductsData';
import { automotiveProducts } from './seedData/automotiveData';
import { petSuppliesProducts } from './seedData/petSuppliesData';
import { travelLuggageProducts } from './seedData/travelLuggageData';
import { officeAccessoriesProducts } from './seedData/officeAccessoriesData';
import { healthWellnessProducts } from './seedData/healthWellnessData';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding WishWise non-food e-commerce platform database...');

  // Clean existing data in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistActivity.deleteMany();
  await prisma.wishlistShare.deleteMany();
  await prisma.wishlistMember.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create Passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const managerPasswordHash = await bcrypt.hash('manager123', 10);
  const customerPasswordHash = await bcrypt.hash('customer123', 10);

  // Users
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@wishwise.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      avatar: null,
      status: 'ACTIVE',
      preference: {
        create: {
          emailAlerts: true,
          inAppAlerts: true,
        }
      }
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Product Manager',
      email: 'manager@wishwise.com',
      passwordHash: managerPasswordHash,
      role: Role.MANAGER,
      avatar: null,
      status: 'ACTIVE',
      preference: {
        create: {
          emailAlerts: true,
          inAppAlerts: true,
        }
      }
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Rabin Thilak',
      email: 'customer@wishwise.com',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      avatar: null,
      status: 'ACTIVE',
      preference: {
        create: {
          emailAlerts: true,
          inAppAlerts: true,
          priceDropAlerts: true,
          stockAlerts: true,
          targetPriceAlerts: true,
          staleAlerts: true,
        }
      }
    },
  });

  const friend = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'collaborator@wishwise.com',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      avatar: null,
      status: 'ACTIVE',
    }
  });

  console.log('Created Seed Users');

  // 20 Non-Food Major Categories & Subcategories
  const categoryDefs = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Laptops, smartphones, audio, smart devices and premium tech.',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Smartphones & Tablets', slug: 'smartphones-tablets' },
        { name: 'Laptops & Computers', slug: 'laptops-computers' },
        { name: 'Audio & Headphones', slug: 'audio-headphones' },
        { name: 'Monitors & Displays', slug: 'monitors-displays' },
      ]
    },
    {
      name: 'Mobile Accessories',
      slug: 'mobile-accessories',
      description: 'Cases, fast chargers, MagSafe mounts, screen protectors, and cables.',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Phone Cases & Covers', slug: 'phone-cases-covers' },
        { name: 'Chargers & Power Banks', slug: 'chargers-power-banks' },
        { name: 'Cables & Adapters', slug: 'cables-adapters' },
        { name: 'Mounts & Stands', slug: 'mounts-stands' },
      ]
    },
    {
      name: "Men's Clothing",
      slug: 'mens-clothing',
      description: 'Trendy t-shirts, casual shirts, denim jeans, jackets and hoodies.',
      image: 'https://images.unsplash.com/photo-1490578474895-699bc4e2cf59?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Shirts & T-Shirts', slug: 'mens-shirts-tshirts' },
        { name: 'Jeans & Trousers', slug: 'mens-jeans-trousers' },
        { name: 'Jackets & Outerwear', slug: 'mens-jackets' },
      ]
    },
    {
      name: "Women's Clothing",
      slug: 'womens-clothing',
      description: 'Stylish dresses, tops, ethnic kurtis, jeans and coats.',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Tops & Shirts', slug: 'womens-tops' },
        { name: 'Dresses & Kurtis', slug: 'womens-dresses-kurtis' },
        { name: 'Jeans & Skirts', slug: 'womens-jeans-skirts' },
      ]
    },
    {
      name: 'Footwear',
      slug: 'footwear',
      description: 'Sneakers, running shoes, loafers, formal shoes, and sandals.',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Sneakers & Casual Shoes', slug: 'sneakers-casual-shoes' },
        { name: 'Sports & Running Shoes', slug: 'sports-running-shoes' },
        { name: 'Formal Shoes & Loafers', slug: 'formal-shoes-loafers' },
      ]
    },
    {
      name: 'Fashion Accessories',
      slug: 'fashion-accessories',
      description: 'Watches, premium sunglasses, leather wallets, belts and backpacks.',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Watches', slug: 'watches' },
        { name: 'Sunglasses', slug: 'sunglasses' },
        { name: 'Wallets & Belts', slug: 'wallets-belts' },
        { name: 'Backpacks & Bags', slug: 'backpacks-bags' },
      ]
    },
    {
      name: 'Jewellery',
      slug: 'jewellery',
      description: 'Elegant rings, necklaces, earrings, bracelets and pendants.',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Rings & Band Rings', slug: 'rings' },
        { name: 'Necklaces & Chains', slug: 'necklaces-chains' },
        { name: 'Earrings & Studs', slug: 'earrings' },
      ]
    },
    {
      name: 'Beauty & Personal Care',
      slug: 'beauty-personal-care',
      description: 'Skincare essentials, trimmers, hair dryers, and fine fragrances.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Skincare & Sunscreen', slug: 'skincare-sunscreen' },
        { name: 'Hair Care & Styling Tools', slug: 'haircare-styling-tools' },
        { name: 'Grooming & Trimmers', slug: 'grooming-trimmers' },
        { name: 'Perfumes & Fragrances', slug: 'perfumes-fragrances' },
      ]
    },
    {
      name: 'Home & Furniture',
      slug: 'home-furniture',
      description: 'Ergonomic chairs, study desks, sofas, lighting and bedding.',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Seating & Sofas', slug: 'seating-sofas' },
        { name: 'Desks & Tables', slug: 'desks-tables' },
        { name: 'Lamps & Lighting', slug: 'lamps-lighting' },
      ]
    },
    {
      name: 'Kitchen Appliances & Utensils',
      slug: 'kitchen-appliances-utensils',
      description: 'Air fryers, electric kettles, mixer grinders, cookware and cutlery. (Non-food kitchenware).',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Small Kitchen Appliances', slug: 'small-kitchen-appliances' },
        { name: 'Cookware & Pans', slug: 'cookware-pans' },
        { name: 'Cutlery & Containers', slug: 'cutlery-containers' },
      ]
    },
    {
      name: 'Home Appliances',
      slug: 'home-appliances',
      description: 'Vacuum cleaners, air purifiers, washing machines, and air conditioners.',
      image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Air Purifiers & Cleaners', slug: 'air-purifiers' },
        { name: 'Vacuum Cleaners', slug: 'vacuum-cleaners' },
        { name: 'Cooling & Heating', slug: 'cooling-heating' },
      ]
    },
    {
      name: 'Sports & Fitness',
      slug: 'sports-fitness',
      description: 'Dumbbells, yoga mats, badminton rackets, footballs, and gym gear.',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Fitness & Dumbbells', slug: 'fitness-dumbbells' },
        { name: 'Yoga & Mat Accessories', slug: 'yoga-mats' },
        { name: 'Racquet & Outdoor Sports', slug: 'racquet-outdoor-sports' },
      ]
    },
    {
      name: 'Books & Stationery',
      slug: 'books-stationery',
      description: 'Bestselling novels, hardcover notebooks, fountain pens, and desk organizers.',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Fiction & Non-Fiction Books', slug: 'fiction-non-fiction-books' },
        { name: 'Notebooks & Journals', slug: 'notebooks-journals' },
        { name: 'Pens & Desk Supplies', slug: 'pens-desk-supplies' },
      ]
    },
    {
      name: 'Toys & Games',
      slug: 'toys-games',
      description: 'LEGO sets, strategic board games, remote control cars, and wooden chess.',
      image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Building Blocks & LEGO', slug: 'building-blocks-lego' },
        { name: 'Board Games & Puzzles', slug: 'board-games-puzzles' },
        { name: 'Action Figures & RC Toys', slug: 'action-figures-rc-toys' },
      ]
    },
    {
      name: 'Baby Products',
      slug: 'baby-products',
      description: 'Strollers, baby monitors, cribs, clothing and feeding kits.',
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Baby Gear & Strollers', slug: 'baby-strollers' },
        { name: 'Nursery & Furniture', slug: 'nursery-furniture' },
        { name: 'Feeding & Care Utensils', slug: 'feeding-care' },
      ]
    },
    {
      name: 'Automotive',
      slug: 'automotive',
      description: 'Helmets, riding gloves, dash cams, car phone mounts, and seat covers.',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Riding Gear & Helmets', slug: 'riding-gear-helmets' },
        { name: 'Car Accessories & Mounts', slug: 'car-accessories-mounts' },
        { name: 'Dash Cams & Car Electronics', slug: 'dash-cams-electronics' },
      ]
    },
    {
      name: 'Pet Supplies',
      slug: 'pet-supplies',
      description: 'Orthopedic pet beds, stainless bowls, leashes, grooming brushes and chew toys. (Strictly non-food).',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Pet Beds & Furniture', slug: 'pet-beds-furniture' },
        { name: 'Collars, Leashes & Harnesses', slug: 'collars-leashes-harnesses' },
        { name: 'Grooming & Toys', slug: 'grooming-toys' },
      ]
    },
    {
      name: 'Travel & Luggage',
      slug: 'travel-luggage',
      description: 'Hard-shell trolley suitcases, travel duffels, packing cubes, and passport wallets.',
      image: 'https://images.unsplash.com/photo-1565026057447-b88e3f29042b?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Trolley Suitcases', slug: 'trolley-suitcases' },
        { name: 'Duffel & Travel Bags', slug: 'duffel-travel-bags' },
        { name: 'Travel Organizers & Accessories', slug: 'travel-organizers' },
      ]
    },
    {
      name: 'Office & Computer Accessories',
      slug: 'office-computer-accessories',
      description: 'Ergonomic mesh chairs, laptop stands, webcams, mouse pads, and USB hubs.',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Ergonomic Chairs & Setup', slug: 'ergonomic-chairs-setup' },
        { name: 'Laptop Stands & Risers', slug: 'laptop-stands-risers' },
        { name: 'Webcams & USB Hubs', slug: 'webcams-usb-hubs' },
      ]
    },
    {
      name: 'Health & Wellness',
      slug: 'health-wellness',
      description: 'Smart body fat scales, digital BP monitors, pulse oximeters, and deep tissue massage guns.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
      subcategories: [
        { name: 'Smart Scales & Monitors', slug: 'smart-scales-monitors' },
        { name: 'Recovery & Massage Guns', slug: 'recovery-massage-guns' },
        { name: 'Supports & Braces', slug: 'supports-braces' },
      ]
    },
  ];

  const categoryMap = new Map<string, any>();
  const subcategoryMap = new Map<string, any>();

  for (const catDef of categoryDefs) {
    const category = await prisma.category.create({
      data: {
        name: catDef.name,
        slug: catDef.slug,
        description: catDef.description,
        image: catDef.image,
      }
    });
    categoryMap.set(catDef.slug, category);

    for (const subDef of catDef.subcategories) {
      const subcategory = await prisma.subcategory.create({
        data: {
          categoryId: category.id,
          name: subDef.name,
          slug: subDef.slug,
          description: `Subcategory of ${catDef.name}`,
        }
      });
      subcategoryMap.set(subDef.slug, subcategory);
    }
  }

  console.log(`Created ${categoryMap.size} Categories and ${subcategoryMap.size} Subcategories`);

  // Rich Product catalog concatenated from 20 category seed modules
  const productsToSeed = [
    ...electronicsProducts,
    ...mobileAccessoriesProducts,
    ...mensClothingProducts,
    ...womensClothingProducts,
    ...footwearProducts,
    ...fashionAccessoriesProducts,
    ...jewelleryProducts,
    ...beautyProducts,
    ...homeFurnitureProducts,
    ...kitchenAppliancesProducts,
    ...homeAppliancesProducts,
    ...sportsFitnessProducts,
    ...booksStationeryProducts,
    ...toysGamesProducts,
    ...babyProductsData,
    ...automotiveProducts,
    ...petSuppliesProducts,
    ...travelLuggageProducts,
    ...officeAccessoriesProducts,
    ...healthWellnessProducts,
  ];

  const createdProducts: any[] = [];

  for (const p of (productsToSeed as any[])) {
    const category = categoryMap.get(p.categorySlug);
    const subcategory = subcategoryMap.get(p.subcategorySlug);

    const product = await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        description: p.description,
        brand: p.brand,
        categoryId: category.id,
        subcategoryId: subcategory ? subcategory.id : null,
        modelNumber: p.modelNumber,
        mrp: p.mrp,
        priceSource: 'VERIFIED_MANUFACTURER',
        priceVerifiedAt: new Date(),
        currentPrice: p.currentPrice,
        originalPrice: p.originalPrice,
        discount: p.discount,
        availabilityStatus: p.availabilityStatus,
        stockQuantity: p.stockQuantity,
        lowStockThreshold: p.lowStockThreshold,
        rating: p.rating,
        reviewCount: p.reviewCount,
        isNewLaunch: p.isNewLaunch ?? false,
        isFeaturedLaunch: p.isFeaturedLaunch ?? false,
        launchDate: p.launchDate ?? null,
        launchOffer: p.launchOffer ?? null,
        tags: p.tags,
        specifications: p.specifications,
        images: {
          create: p.images.map((img: any, idx: number) => ({
            url: img.url,
            isPrimary: img.isPrimary,
            altText: img.altText,
            sortOrder: idx,
          }))
        },
        inventory: {
          create: {
            stockQuantity: p.stockQuantity,
            lowStockThreshold: p.lowStockThreshold,
          }
        },
        priceHistory: {
          createMany: {
            data: [
              {
                previousPrice: p.mrp,
                newPrice: p.originalPrice,
                changePercentage: -((p.mrp - p.originalPrice) / p.mrp) * 100,
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
              {
                previousPrice: p.originalPrice,
                newPrice: p.currentPrice,
                changePercentage: -((p.originalPrice - p.currentPrice) / p.originalPrice) * 100,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              }
            ]
          }
        }
      },
      include: {
        images: true
      }
    });

    // Create Variants if present
    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: v.sku,
            name: v.name,
            price: v.price,
            mrp: v.mrp,
            stockQuantity: v.stockQuantity,
            attributes: v.attributes,
          }
        });
      }
    }

    createdProducts.push(product);
  }

  console.log(`Created ${createdProducts.length} Seed Products with Multi-Images & Product Variants`);

  // Fetch created variants for Wishlist and Cart linking
  const iPhone = createdProducts.find(p => p.sku === 'PROD-ELE-001');
  const iPhoneVariants = await prisma.productVariant.findMany({ where: { productId: iPhone.id } });
  
  const Nike = createdProducts.find(p => p.sku === 'PROD-FTW-001');
  const NikeVariants = await prisma.productVariant.findMany({ where: { productId: Nike.id } });

  const SonyHeadphones = createdProducts.find(p => p.sku === 'PROD-ELE-003');
  const AirFryer = createdProducts.find(p => p.sku === 'PROD-KAP-001');
  const Luggage = createdProducts.find(p => p.sku === 'PROD-TRV-001');

  // Wishlists for customer
  const personalWishlist = await prisma.wishlist.create({
    data: {
      userId: customer.id,
      name: 'Personal Favorites ❤️',
      description: 'My main wishlist for high-priority tech & lifestyle items.',
      visibility: Visibility.PRIVATE,
      items: {
        create: [
          {
            productId: iPhone.id,
            variantId: iPhoneVariants[0]?.id,
            selectedVariant: (iPhoneVariants[0]?.attributes as any) || { Storage: '256GB', Color: 'Natural Titanium' },
            priority: Priority.MUST_BUY,
            notes: 'Upgrading for camera & video recording capabilities.',
            targetPrice: 140000,
            addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            productId: Nike.id,
            variantId: NikeVariants[1]?.id,
            selectedVariant: (NikeVariants[1]?.attributes as any) || { Size: 'UK 9', Color: 'Triple White' },
            priority: Priority.HIGH,
            notes: 'Daily footwear requirement.',
            targetPrice: 8000,
            addedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          },
          {
            productId: SonyHeadphones.id,
            priority: Priority.MEDIUM,
            notes: 'Waiting for extra ₹2000 price drop alert.',
            targetPrice: 25000,
            addedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // > 90 days stale item
            isStale: true,
          }
        ]
      },
      activities: {
        create: [
          {
            userId: customer.id,
            action: 'WISHLIST_CREATED',
            details: 'Created Personal Favorites wishlist',
          },
          {
            userId: customer.id,
            action: 'ITEM_ADDED',
            details: `Added ${iPhone.name} (256GB Natural Titanium)`,
          }
        ]
      }
    }
  });

  const travelWishlist = await prisma.wishlist.create({
    data: {
      userId: customer.id,
      name: 'Travel & Vacations ✈️',
      description: 'Collaborative checklist for upcoming trips with friends.',
      visibility: Visibility.SHARED,
      shareToken: 'travel-vacations-token-4421',
      items: {
        create: [
          {
            productId: Luggage.id,
            priority: Priority.MUST_BUY,
            targetPrice: 15500,
            addedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            planningToBuyUserId: friend.id,
            planningToBuyName: 'Alex Johnson',
          },
          {
            productId: AirFryer.id,
            priority: Priority.LOW,
            notes: 'For vacation home kitchen setup.',
            addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          }
        ]
      },
      members: {
        create: {
          userId: friend.id,
          permission: MemberPermission.MANAGE,
        }
      }
    }
  });

  console.log('Created User Wishlists with Variant Snapshots');

  // Customer Cart with Selected Variant
  await prisma.cart.create({
    data: {
      userId: customer.id,
      items: {
        create: [
          {
            productId: Nike.id,
            variantId: NikeVariants[1]?.id,
            selectedVariant: (NikeVariants[1]?.attributes as any) || { Size: 'UK 9', Color: 'Triple White' },
            quantity: 1,
            priceSnapshot: Nike.currentPrice,
          }
        ]
      }
    }
  });

  // Sample Order history
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-8801',
      userId: customer.id,
      totalAmount: 144900,
      status: OrderStatus.DELIVERED,
      shippingAddress: '123 Tech Park Avenue, Suite 400',
      items: {
        create: [
          {
            productId: iPhone.id,
            variantId: iPhoneVariants[0]?.id,
            selectedVariant: (iPhoneVariants[0]?.attributes as any),
            quantity: 1,
            unitPrice: 144900,
          }
        ]
      }
    }
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: customer.id,
        type: NotificationType.TARGET_PRICE_REACHED,
        title: '🎯 Target Price Reached!',
        message: `Sony WH-1000XM5 price dropped near your target price! Current: ₹${SonyHeadphones.currentPrice}`,
        relatedProductId: SonyHeadphones.id,
        relatedWishlistId: personalWishlist.id,
        read: false,
      },
      {
        userId: customer.id,
        type: NotificationType.LOW_STOCK,
        title: '⚠️ Low Stock Alert',
        message: `Only 2 units remaining for Yonex Astrox 99 Pro Racket!`,
        relatedProductId: createdProducts.find(p => p.sku === 'PROD-SPO-001')?.id,
        relatedWishlistId: personalWishlist.id,
        read: false,
      }
    ]
  });

  // Reviews
  await prisma.review.create({
    data: {
      productId: iPhone.id,
      userId: customer.id,
      rating: 5,
      title: 'Peak Camera Performance',
      comment: 'The 5x telephoto lens and titanium frame make this phone lightweight and ultra responsive.',
    }
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: 'NON_FOOD_CATALOG_OVERHAUL',
      entity: 'SYSTEM',
      metadata: { message: 'Database populated with 20 non-food categories, variants, and high-res multi-image galleries.' }
    }
  });

  console.log('Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
