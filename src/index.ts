import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import paystackRoutes from "./routes/paystack.js";
import webhook from "./webhook.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Frontend is at root level: paystack/frontend
const frontendPath = path.join(__dirname, "../../../frontend");

const app = express();

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-paystack-signature");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(frontendPath));

app.use("/paystack", paystackRoutes);
app.use("/webhook/paystack", webhook);

// Serve frontend index.html for root route
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(4000, () => {
  console.log("🚀 Server running on port 4000");
});
