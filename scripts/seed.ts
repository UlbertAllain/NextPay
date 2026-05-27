import dotenv from "dotenv";


import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

dotenv.config({
  path: ".env.local",
});

const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (!serviceAccount.projectId) {
  throw new Error("FIREBASE_ADMIN_PROJECT_ID belum terbaca dari .env.local");
}

if (!serviceAccount.clientEmail) {
  throw new Error("FIREBASE_ADMIN_CLIENT_EMAIL belum terbaca dari .env.local");
}

if (!serviceAccount.privateKey) {
  throw new Error("FIREBASE_ADMIN_PRIVATE_KEY belum terbaca dari .env.local");
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

async function seed() {
  const now = Timestamp.now();
  const sellerId = process.env.SEED_SELLER_ID;

if (!sellerId) {
  throw new Error("SEED_SELLER_ID belum diisi di .env.local");
}

const accountListings = [
  {
    id: "account-ml-001",
    sellerId,
    game: "mobile-legends",
    title: "Akun ML Mythic Immortal 200 Skin",
    description: "Akun aman, email bisa diganti, banyak skin collector.",
    price: 750000,
    rank: "Mythic Immortal",
    level: 89,
    skins: 200,
    heroes: 120,
    images: [],
    verified: true,
    status: "published",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "account-ml-002",
    sellerId,
    game: "mobile-legends",
    title: "Akun ML Mythical Glory 150 Skin",
    description: "Rank tinggi, winrate bagus, cocok untuk push ranked.",
    price: 580000,
    rank: "Mythical Glory",
    level: 74,
    skins: 150,
    heroes: 112,
    images: [],
    verified: true,
    status: "published",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "account-ml-003",
    sellerId,
    game: "mobile-legends",
    title: "Akun ML Legend Murah Banyak Hero",
    description: "Akun budget, hero lengkap, cocok untuk akun kedua.",
    price: 230000,
    rank: "Legend",
    level: 52,
    skins: 68,
    heroes: 96,
    images: [],
    verified: false,
    status: "published",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "account-pubg-001",
    sellerId,
    game: "pubg-mobile",
    title: "Akun PUBG Conqueror Banyak Outfit",
    description: "Akun PUBG rare outfit, statistik bagus, siap main.",
    price: 900000,
    rank: "Conqueror",
    level: 71,
    skins: 88,
    heroes: 0,
    images: [],
    verified: true,
    status: "published",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "account-pubg-002",
    sellerId,
    game: "pubg-mobile",
    title: "Akun PUBG Ace Master Koleksi Senjata",
    description: "Banyak skin senjata, outfit event, dan inventory rapi.",
    price: 520000,
    rank: "Ace Master",
    level: 63,
    skins: 56,
    heroes: 0,
    images: [],
    verified: true,
    status: "published",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "account-ff-001",
    sellerId,
    game: "free-fire",
    title: "Akun Free Fire Heroic Bundle Sultan",
    description: "Bundle banyak, emote rare, akun siap push.",
    price: 420000,
    rank: "Heroic",
    level: 68,
    skins: 120,
    heroes: 35,
    images: [],
    verified: true,
    status: "published",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "account-ff-002",
    sellerId,
    game: "free-fire",
    title: "Akun Free Fire Master Murah",
    description: "Akun murah untuk main ranked, beberapa bundle event.",
    price: 180000,
    rank: "Master",
    level: 44,
    skins: 45,
    heroes: 24,
    images: [],
    verified: false,
    status: "published",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "account-hok-001",
    sellerId,
    game: "honor-of-kings",
    title: "Akun HOK Grandmaster Skin Epic",
    description: "Akun Honor of Kings dengan hero dan skin bagus.",
    price: 350000,
    rank: "Grandmaster",
    level: 48,
    skins: 38,
    heroes: 61,
    images: [],
    verified: true,
    status: "published",
    createdAt: now,
    updatedAt: now,
  },
];

  const products = [
    {
      id: "ml-86-diamond",
      category: "game",
      name: "Mobile Legends - 86 Diamond",
      slug: "mobile-legends-86-diamond",
      provider: "digiflazz",
      providerCode: "ML86",
      basePrice: 21000,
      sellPrice: 23000,
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "pubg-60-uc",
      category: "game",
      name: "PUBG Mobile - 60 UC",
      slug: "pubg-mobile-60-uc",
      provider: "digiflazz",
      providerCode: "PUBG60",
      basePrice: 12500,
      sellPrice: 14500,
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "canva-pro-1-month",
      category: "subscription",
      name: "Canva Pro 1 Bulan",
      slug: "canva-pro-1-bulan",
      provider: "manual",
      basePrice: 30000,
      sellPrice: 39000,
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const mlAccounts = [
    {
      id: "ml-account-001",
      sellerId: "dummy-seller-001",
      title: "Akun ML Mythic 145 Skin",
      rank: "Mythic",
      skins: 145,
      heroes: 118,
      price: 750000,
      status: "published",
      verified: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ml-account-002",
      sellerId: "dummy-seller-001",
      title: "Akun ML Legend Banyak Skin",
      rank: "Legend",
      skins: 98,
      heroes: 104,
      price: 430000,
      status: "published",
      verified: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const orders = [
    {
      id: "order-001",
      invoice: "NPY-2026-0001",
      userId: "dummy-user-001",
      type: "topup",
      title: "Top Up Mobile Legends - 86 Diamond",
      amount: 22000,
      adminFee: 1000,
      totalAmount: 23000,
      status: "success",
      paymentStatus: "paid",
      paymentProvider: "tripay",
      paymentReference: "TRIPAY-DUMMY-001",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "order-002",
      invoice: "NPY-2026-0002",
      userId: "dummy-user-001",
      type: "subscription",
      title: "Canva Pro 1 Bulan",
      amount: 39000,
      adminFee: 0,
      totalAmount: 39000,
      status: "processing",
      paymentStatus: "paid",
      paymentProvider: "tripay",
      paymentReference: "TRIPAY-DUMMY-002",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const rekberTransactions = [
    {
      id: "rekber-001",
      invoice: "RKB-2026-0001",
      buyerId: "dummy-user-001",
      sellerId: "dummy-seller-001",
      sellerContact: "@seller_ml",
      itemName: "Akun ML Mythic",
      itemDescription: "Akun Mythic dengan 145 skin.",
      amount: 750000,
      fee: 10000,
      totalAmount: 760000,
      status: "holding_fund",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const batch = db.batch();

  for (const item of products) {
    batch.set(db.collection("products").doc(item.id), item);
  }

  for (const item of mlAccounts) {
    batch.set(db.collection("ml_accounts").doc(item.id), item);
  }

  for (const item of orders) {
    batch.set(db.collection("orders").doc(item.id), item);
  }

  for (const item of rekberTransactions) {
    batch.set(db.collection("rekber_transactions").doc(item.id), item);
  }

  for (const item of accountListings) {
  batch.set(db.collection("account_listings").doc(item.id), item);
}
  await batch.commit();

  console.log("Seed dummy data selesai.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});