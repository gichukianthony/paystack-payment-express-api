import { Router } from "express";
import axios from "axios";
import { db } from "../db";
import { payments } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { validateInitializePayment, validateVerifyPayment } from "../utils/validation.js";
import type { InitializePaymentRequest, VerifyPaymentRequest } from "../types/paystack.js";
import 'dotenv/config';

const router = Router();

// Health check / API info
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Paystack API is running",
    endpoints: {
      initialize: "POST /paystack/initialize",
      verify: "POST /paystack/verify",
      getPayment: "GET /paystack/payment/:reference",
      getAllPayments: "GET /paystack/payments?limit=50&offset=0",
      webhook: "POST /webhook/paystack"
    },
    environment: {
      hasSecretKey: !!process.env.PAYSTACK_SECRET_KEY,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    }
  });
});

// Initialize payment - creates a payment reference
router.post("/initialize", async (req, res) => {
  try {
    const body: InitializePaymentRequest = req.body;
    const validation = validateInitializePayment(body);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: validation.message 
      });
    }

    const { email, amount, currency = "KES", metadata } = body;

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: "Paystack secret key not configured" 
      });
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Convert to kobo/cents
        currency,
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      data: {
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference,
      },
    });
  } catch (error: any) {
    console.error("Initialize payment error:", error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Failed to initialize payment",
    });
  }
});

// Get payment by reference
router.get("/payment/:reference", async (req, res) => {
  try {
    const { reference } = req.params;

    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.reference, reference))
      .limit(1);

    if (payment.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.json({
      success: true,
      data: payment[0],
    });
  } catch (error: any) {
    console.error("Get payment error:", error);
    
    // Check if it's a database connection error
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      return res.status(500).json({
        success: false,
        message: "Database tables not found. Please run: pnpm run db:setup",
        error: "Tables need to be created"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get all payments
router.get("/payments", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const allPayments = await db
      .select()
      .from(payments)
      .orderBy(desc(payments.createdAt))
      .limit(Math.min(limit, 100)) // Max 100
      .offset(offset);

    const totalCount = await db.select().from(payments);

    res.json({
      success: true,
      data: allPayments,
      pagination: {
        total: totalCount.length,
        limit,
        offset,
        hasMore: offset + limit < totalCount.length,
      },
    });
  } catch (error: any) {
    console.error("Get payments error:", error);
    
    // Check if it's a database connection error
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      return res.status(500).json({
        success: false,
        message: "Database tables not found. Please run: pnpm run db:setup",
        error: "Tables need to be created"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payments",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Verify payment
router.post("/verify", async (req, res) => {
  try {
    const body: VerifyPaymentRequest = req.body;
    const validation = validateVerifyPayment(body);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: validation.message 
      });
    }

    const { reference } = body;

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: "Paystack secret key not configured" 
      });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;

    if (data.status !== "success") {
      return res.status(400).json({ 
        success: false, 
        message: "Transaction not successful",
        status: data.status 
      });
    }

    // Check if payment already exists
    try {
      const existingPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.reference, reference))
        .limit(1);

      if (existingPayments.length === 0) {
        await db.insert(payments).values({
          reference,
          amount: data.amount,
          currency: data.currency,
          status: "success",
        });
      }
    } catch (dbError: any) {
      // Log database error but don't fail the verification
      console.error("Database error during payment save:", dbError);
      // Continue with successful verification response
    }

    res.json({ 
      success: true, 
      data: {
        reference: data.reference,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
      }
    });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "Transaction reference not found",
      });
    }

    res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Failed to verify payment",
    });
  }
});

export default router;
