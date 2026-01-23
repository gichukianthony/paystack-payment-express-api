# 💳 Paystack Payment Integration

A complete Paystack payment integration backend with a modern frontend testing interface. This project provides a full-stack solution for handling payments, verification, and webhook events using Paystack API.

## ✨ Features

### Backend Features
- ✅ **Payment Initialization** - Create payment references and authorization URLs
- ✅ **Payment Verification** - Verify transaction status using payment references
- ✅ **Payment Lookup** - Retrieve payment details by reference
- ✅ **Payment History** - List all payments with pagination
- ✅ **Webhook Handling** - Process Paystack webhook events securely
- ✅ **Database Integration** - PostgreSQL database with Drizzle ORM
- ✅ **Input Validation** - Email and amount validation
- ✅ **Error Handling** - Comprehensive error handling and logging
- ✅ **CORS Support** - Frontend integration ready
- ✅ **TypeScript** - Fully typed with TypeScript interfaces

### Frontend Features
- 🎨 **Modern UI** - Beautiful gradient design with responsive layout
- 🔄 **Real-time Updates** - Auto-refresh payments every 30 seconds
- 📊 **Payment Dashboard** - View all payments with detailed information
- 🧪 **Testing Interface** - Easy-to-use forms for testing all endpoints
- 📱 **Responsive Design** - Works on desktop and mobile devices
- ⚡ **Quick Actions** - One-click verify and reference lookup

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- pnpm (or npm/yarn)
- Paystack account with API keys

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd paystack
   ```

2. **Install dependencies**
   ```bash
   cd backend
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Paystack Configuration
   PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
   
   # Database Configuration
   DATABASE_URL=postgresql://paystack:paystack@localhost:5432/paystack_db
   
   # Optional: Node Environment
   NODE_ENV=development
   ```

4. **Set up the database**
   
   Start PostgreSQL (using Docker Compose):
   ```bash
   docker-compose up -d
   ```
   
   Or use your existing PostgreSQL instance and update `DATABASE_URL` accordingly.
   
   Create database tables:
   ```bash
   cd backend
   pnpm run db:setup
   ```

5. **Start the development server**
   ```bash
   cd backend
   pnpm run dev
   ```

6. **Access the frontend**
   
   Open your browser and navigate to:
   ```
   http://localhost:4000
   ```

## 📁 Project Structure

```
paystack/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts          # Database connection
│   │   │   ├── schema.ts         # Database schema definitions
│   │   │   ├── setup.ts          # Database setup script
│   │   │   └── migrate.ts         # Migration script
│   │   ├── routes/
│   │   │   └── paystack.ts       # Paystack API routes
│   │   ├── types/
│   │   │   └── paystack.ts       # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── validation.ts     # Input validation utilities
│   │   ├── webhook.ts            # Webhook handler
│   │   └── index.ts              # Express server setup
│   ├── drizzle.config.ts         # Drizzle ORM configuration
│   ├── package.json
│   ├── tsconfig.json
│   └── app.http                  # HTTP test requests
├── frontend/
│   └── index.html                # Frontend testing interface
├── docker-compose.yml             # Docker Compose configuration
└── README.md                      # This file
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:4000
```

### Endpoints

#### 1. Health Check / API Info
```http
GET /paystack
```
Returns API status and available endpoints.

**Response:**
```json
{
  "success": true,
  "message": "Paystack API is running",
  "endpoints": {
    "initialize": "POST /paystack/initialize",
    "verify": "POST /paystack/verify",
    "getPayment": "GET /paystack/payment/:reference",
    "getAllPayments": "GET /paystack/payments?limit=50&offset=0",
    "webhook": "POST /webhook/paystack"
  }
}
```

#### 2. Initialize Payment
```http
POST /paystack/initialize
Content-Type: application/json

{
  "email": "user@example.com",
  "amount": 3000,
  "currency": "KES",
  "metadata": {
    "custom_fields": [...]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "ACCESS_CODE",
    "reference": "REFERENCE_CODE"
  }
}
```

#### 3. Verify Payment
```http
POST /paystack/verify
Content-Type: application/json

{
  "reference": "payment_reference"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reference": "payment_reference",
    "amount": 300000,
    "currency": "KES",
    "status": "success"
  }
}
```

#### 4. Get Payment by Reference
```http
GET /paystack/payment/:reference
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "reference": "payment_reference",
    "amount": 300000,
    "currency": "KES",
    "status": "success",
    "created_at": "2026-01-23T..."
  }
}
```

#### 5. Get All Payments
```http
GET /paystack/payments?limit=50&offset=0
```

**Query Parameters:**
- `limit` (optional): Number of payments to return (default: 50, max: 100)
- `offset` (optional): Number of payments to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "reference": "payment_reference",
      "amount": 300000,
      "currency": "KES",
      "status": "success",
      "created_at": "2026-01-23T..."
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

#### 6. Webhook Endpoint
```http
POST /webhook/paystack
Content-Type: application/json
x-paystack-signature: signature_hash

{
  "event": "charge.success",
  "data": {
    "reference": "payment_reference",
    "amount": 300000,
    "currency": "KES",
    "status": "success"
  }
}
```

## 🗄️ Database

### Schema

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  reference TEXT UNIQUE,
  amount INTEGER,
  currency TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  plan_code TEXT,
  subscription_code TEXT,
  email_token TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Database Commands

```bash
# Create database tables
pnpm run db:setup

# Generate migrations
pnpm run db:generate

# Run migrations
pnpm run db:migrate

# Push schema changes
pnpm run db:push
```

## 🧪 Testing

### Using the Frontend

1. Start the server: `pnpm run dev`
2. Open `http://localhost:4000` in your browser
3. Use the testing interface to:
   - Initialize payments
   - Verify payments
   - View payment history
   - Lookup specific payments

### Using HTTP Files

The project includes `backend/app.http` with pre-configured test requests. Use it with REST Client extensions in VS Code or similar tools.

### Using cURL

```bash
# Initialize payment
curl -X POST http://localhost:4000/paystack/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "amount": 3000,
    "currency": "KES"
  }'

# Verify payment
curl -X POST http://localhost:4000/paystack/verify \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "payment_reference"
  }'

# Get all payments
curl http://localhost:4000/paystack/payments
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PAYSTACK_SECRET_KEY` | Your Paystack secret key (starts with `sk_test_` or `sk_live_`) | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NODE_ENV` | Environment (development/production) | No |

### Getting Paystack API Keys

1. Sign up at [Paystack](https://paystack.com)
2. Go to Settings → API Keys & Webhooks
3. Copy your **Secret Key** (test or live)
4. Add it to your `.env` file

## 🐳 Docker Support

The project includes Docker Compose configuration for easy database setup:

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down
```

The Docker Compose file sets up:
- PostgreSQL 15
- Database: `paystack_db`
- User: `paystack`
- Password: `paystack`
- Port: `5432`

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm run dev          # Start development server with hot reload

# Build
pnpm run build        # Compile TypeScript to JavaScript
pnpm run start        # Run production build

# Database
pnpm run db:setup     # Create database tables
pnpm run db:generate  # Generate migrations
pnpm run db:migrate   # Run migrations
pnpm run db:push      # Push schema changes
```

### Tech Stack

- **Backend:**
  - Node.js + Express
  - TypeScript
  - Drizzle ORM
  - PostgreSQL
  - Axios (HTTP client)

- **Frontend:**
  - Vanilla JavaScript
  - Modern CSS (Gradients, Flexbox, Grid)
  - Paystack Inline.js

## 📝 Webhook Configuration

To receive webhook events from Paystack:

1. Go to your Paystack Dashboard
2. Navigate to Settings → API Keys & Webhooks
3. Add webhook URL: `https://your-domain.com/webhook/paystack`
4. Paystack will send events like:
   - `charge.success`
   - `transaction.success`
   - `subscription.create`
   - `subscription.disable`

The webhook handler automatically:
- Verifies webhook signatures
- Saves successful payments to database
- Handles subscription events

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## 🔒 Security Features

- ✅ Webhook signature verification
- ✅ Input validation
- ✅ SQL injection protection (via Drizzle ORM)
- ✅ CORS configuration
- ✅ Environment variable protection
- ✅ Error message sanitization in production

## 📚 Additional Resources

- [Paystack API Documentation](https://paystack.com/docs/api)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Express.js Documentation](https://expressjs.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Check database connection
psql -h localhost -U paystack -d paystack_db
```

### Tables Not Found

```bash
# Run database setup
cd backend
pnpm run db:setup
```

### Port Already in Use

Change the port in `backend/src/index.ts`:
```typescript
app.listen(4000, () => {
  // Change 4000 to your preferred port
});
```

### CORS Issues

CORS is configured to allow all origins in development. For production, update the CORS middleware in `backend/src/index.ts` to specify allowed origins.

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check the Paystack documentation
- Review the error logs in the console

---


