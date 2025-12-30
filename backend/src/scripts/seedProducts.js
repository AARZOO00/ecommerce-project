// backend/src/scripts/seedProducts.js
require("dotenv").config();
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Product = require("../models/Products"); // ya "../models/Product" agar file ka naam alag ho

// ---- helper: ek product generate karo ----
function generateProduct() {
  const categories = ["Electronics", "Fashion", "Home", "Books", "Grocery"];
  const brandsByCategory = {
    Electronics: ["Samsung", "Apple", "OnePlus", "Sony", "HP", "Dell", "Lenovo"],
    Fashion: ["Adidas", "Nike", "Puma", "Levi's", "Vero Moda", "U.S. Polo Assn."],
    Home: ["Philips", "Prestige", "Milton", "Durian", "Bombay Dyeing"],
    Books: ["Penguin", "HarperCollins", "Plata Publishing", "Bloomsbury"],
    Grocery: ["Aashirvaad", "Tata", "Fortune", "Nestle", "Amul"],
  };

  const category = faker.helpers.arrayElement(categories);
  const brand = faker.helpers.arrayElement(brandsByCategory[category]);

  // name templates
  const nameByCategory = {
    Electronics: () =>
      faker.commerce.productName() + " " + faker.number.int({ min: 1, max: 999 }),
    Fashion: () =>
      `${faker.person.gender() === "male" ? "Men's" : "Women's"} ${faker.commerce.productAdjective()} ${faker.commerce.product()}`,
    Home: () => faker.commerce.productName(),
    Books: () => faker.lorem.words({ min: 2, max: 5 }),
    Grocery: () => faker.commerce.productName(),
  };

  const name = nameByCategory[category]();

  const priceRanges = {
    Electronics: { min: 1500, max: 150000 },
    Fashion: { min: 299, max: 4999 },
    Home: { min: 399, max: 9999 },
    Books: { min: 199, max: 999 },
    Grocery: { min: 50, max: 2000 },
  };

  const { min, max } = priceRanges[category];

  const price = faker.number.int({ min, max });
  const rating = faker.number.float({ min: 3, max: 5, multipleOf: 0.1 });
  const numReviews = faker.number.int({ min: 0, max: 5000 });
  const inStock = faker.datatype.boolean({ probability: 0.8 });

  return {
    name,
    description: faker.commerce.productDescription(),
    price,
    category,
    brand,
    image: faker.image.url(), // placeholder image URL
    inStock,
    rating,
    numReviews,
  };
}

// ---- main seeding function ----
const seedProducts = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not set in .env");
    }

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully!");

    // Purane products hata do
    await Product.deleteMany({});
    console.log("Existing products cleared.");

    const TOTAL = 20000; // yahan count control kar sakti ho
    const BATCH_SIZE = 1000;

    let insertedCount = 0;

    for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
      const batch = [];
      for (let j = 0; j < BATCH_SIZE && i + j < TOTAL; j++) {
        batch.push(generateProduct());
      }
      const inserted = await Product.insertMany(batch);
      insertedCount += inserted.length;
      console.log(`Inserted ${insertedCount}/${TOTAL} products...`);
    }

    console.log(`${insertedCount} products inserted successfully!`);
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();
