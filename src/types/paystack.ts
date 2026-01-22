// TypeScript interfaces for Paystack API

export interface InitializePaymentRequest {
  email: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface VerifyPaymentRequest {
  reference: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    authorization_url?: string;
    access_code?: string;
  };
  message?: string;
}

export interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    customer?: {
      email: string;
    };
    [key: string]: any;
  };
}
