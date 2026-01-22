import crypto from "crypto";
import { Router } from "express";
import { db } from "./db/index.js";
import { payments } from "./db/schema.js";
import { eq } from "drizzle-orm";
import type { PaystackWebhookEvent } from "./types/paystack.js";
import 'dotenv/config';

const router = Router();

router.post("/", async (req, res) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error("Paystack secret key not configured");
      return res.sendStatus(500);
    }

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    const signature = req.headers["x-paystack-signature"] as string;

    if (hash !== signature) {
      console.error("Invalid webhook signature");
      return res.sendStatus(401);
    }

    const event: PaystackWebhookEvent = req.body;

    console.log(`Webhook event received: ${event.event}`);

    // Handle charge.success event
    if (event.event === "charge.success" || event.event === "transaction.success") {
      const transactionData = event.data;
      const reference = transactionData.reference;

      if (!reference) {
        console.error("No reference found in webhook data");
        return res.sendStatus(400);
      }

      // Check if payment already exists
      const existingPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.reference, reference))
        .limit(1);

      if (existingPayments.length === 0) {
        // Insert new payment
        await db.insert(payments).values({
          reference,
          amount: transactionData.amount,
          currency: transactionData.currency || "KES",
          status: transactionData.status || "success",
        });
        console.log(`Payment saved: ${reference}`);
      } else {
        // Update existing payment status
        console.log(`Payment already exists: ${reference}`);
      }
    }

    // Handle subscription events
    if (event.event === "subscription.disable") {
      console.log("Subscription disabled:", event.data);
      // TODO: Update subscription status in database
    }

    if (event.event === "subscription.create") {
      console.log("Subscription created:", event.data);
      // TODO: Save subscription to database
    }

    res.sendStatus(200);
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
});

export default router;
