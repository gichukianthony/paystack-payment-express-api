import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow()
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  reference: text("reference").unique(),
  amount: integer("amount"),
  currency: text("currency"),
  status: text("status"),
  createdAt: timestamp("created_at").defaultNow()
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  planCode: text("plan_code"),
  subscriptionCode: text("subscription_code"),
  emailToken: text("email_token"),
  status: text("status"),
  createdAt: timestamp("created_at").defaultNow()
});
