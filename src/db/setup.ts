import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pkg from "pg";
import * as schema from "./schema.js";
import "dotenv/config";

const { Pool } = pkg;

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  console.log("Setting up database tables...");

  try {
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Users table created");

    // Create payments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        reference TEXT UNIQUE,
        amount INTEGER,
        currency TEXT,
        status TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Payments table created");

    // Create subscriptions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        plan_code TEXT,
        subscription_code TEXT,
        email_token TEXT,
        status TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Subscriptions table created");

    console.log("🎉 Database setup completed successfully!");
  } catch (error: any) {
    console.error("❌ Database setup failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
