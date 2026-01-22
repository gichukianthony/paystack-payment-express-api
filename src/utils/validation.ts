// Validation utilities

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidAmount(amount: number): boolean {
  return amount > 0 && Number.isFinite(amount);
}

export function validateInitializePayment(body: any): { valid: boolean; message?: string } {
  if (!body.email) {
    return { valid: false, message: "Email is required" };
  }
  
  if (!isValidEmail(body.email)) {
    return { valid: false, message: "Invalid email format" };
  }
  
  if (!body.amount) {
    return { valid: false, message: "Amount is required" };
  }
  
  if (!isValidAmount(body.amount)) {
    return { valid: false, message: "Amount must be a positive number" };
  }
  
  return { valid: true };
}

export function validateVerifyPayment(body: any): { valid: boolean; message?: string } {
  if (!body.reference) {
    return { valid: false, message: "Reference is required" };
  }
  
  if (typeof body.reference !== "string" || body.reference.trim().length === 0) {
    return { valid: false, message: "Reference must be a non-empty string" };
  }
  
  return { valid: true };
}
