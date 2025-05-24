import crypto from 'crypto';
import { config } from '../config';

export interface PayHerePaymentData {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash: string;
}

export interface PayHereNotification {
  merchant_id: string;
  order_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
  custom_1?: string;
  custom_2?: string;
  method?: string;
  status_message?: string;
  card_holder_name?: string;
  card_no?: string;
}

export class PayHereService {
  private merchantId: string;
  private merchantSecret: string;
  private baseUrl: string;
  private sandbox: boolean;
  private backendUrl: string;

  constructor() {
    this.merchantId = config.payhere.merchantId;
    this.merchantSecret = config.payhere.merchantSecret;
    this.baseUrl = config.payhere.baseUrl;
    this.sandbox = config.payhere.sandbox;
    this.backendUrl = config.payhere.backendUrl;

    // Debug logging
    console.log('🔧 PayHere Configuration:');
    console.log(`   Sandbox Mode: ${this.sandbox}`);
    console.log(`   PayHere Base URL: ${this.baseUrl}`);
    console.log(`   Backend URL: ${this.backendUrl}`);
    console.log(`   Merchant ID: ${this.merchantId}`);
    console.log(`   Environment USE_LIVE_PAYHERE: ${process.env.USE_LIVE_PAYHERE}`);
    console.log(`   Environment NODE_ENV: ${process.env.NODE_ENV}`);
  }

  /**
   * Generate MD5 hash for PayHere payment
   */
  private generateHash(
    merchantId: string,
    orderId: string,
    amount: string,
    currency: string,
    merchantSecret: string
  ): string {
    const hashString = `${merchantId}${orderId}${amount}${currency}${merchantSecret.toUpperCase()}`;
    return crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
  }

  /**
   * Generate MD5 hash for PayHere notification verification
   */
  private generateNotificationHash(
    merchantId: string,
    orderId: string,
    amount: string,
    currency: string,
    statusCode: string,
    merchantSecret: string
  ): string {
    const hashString = `${merchantId}${orderId}${amount}${currency}${statusCode}${merchantSecret.toUpperCase()}`;
    return crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
  }

  /**
   * Create PayHere payment data for form submission
   */
  createPaymentData(
    orderId: string,
    amount: number,
    customerName: string,
    customerPhone: string,
    customerEmail: string = 'customer@realtaste.lk'
  ): PayHerePaymentData {
    const amountStr = amount.toFixed(2);
    const currency = 'LKR';

    // Split customer name
    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'RealTaste';

    // Generate hash
    const hash = this.generateHash(
      this.merchantId,
      orderId,
      amountStr,
      currency,
      this.merchantSecret
    );

    // Base URL for callbacks - use configured backend URL
    const baseCallbackUrl = `${this.backendUrl}/api/payments`;

    console.log(`💳 Creating PayHere payment for Order ${orderId}:`);
    console.log(`   Amount: LKR ${amountStr}`);
    console.log(`   Sandbox Mode: ${this.sandbox}`);
    console.log(`   PayHere URL: ${this.baseUrl}/pay`);
    console.log(`   Callback Base: ${baseCallbackUrl}`);

    return {
      merchant_id: this.merchantId,
      return_url: `${baseCallbackUrl}/return`,
      cancel_url: `${baseCallbackUrl}/cancel`,
      notify_url: `${baseCallbackUrl}/webhook`,
      order_id: orderId,
      items: 'RealTaste Food Order',
      currency,
      amount: amountStr,
      first_name: firstName,
      last_name: lastName,
      email: customerEmail,
      phone: customerPhone,
      address: 'Colombo',
      city: 'Colombo',
      country: 'Sri Lanka',
      hash
    };
  }

  /**
   * Verify PayHere notification
   */
  verifyNotification(notification: PayHereNotification): boolean {
    const expectedHash = this.generateNotificationHash(
      notification.merchant_id,
      notification.order_id,
      notification.payhere_amount,
      notification.payhere_currency,
      notification.status_code,
      this.merchantSecret
    );

    return expectedHash === notification.md5sig;
  }

  /**
   * Get PayHere payment form URL
   */
  getPaymentUrl(): string {
    return `${this.baseUrl}/pay`;
  }

  /**
   * Check if payment was successful based on status code
   */
  isPaymentSuccessful(statusCode: string): boolean {
    return statusCode === '2'; // PayHere success status code
  }

  /**
   * Get payment status message
   */
  getStatusMessage(statusCode: string): string {
    const statusMessages: { [key: string]: string } = {
      '2': 'Payment successful',
      '0': 'Payment pending',
      '-1': 'Payment cancelled',
      '-2': 'Payment failed',
      '-3': 'Payment charged back'
    };

    return statusMessages[statusCode] || 'Unknown payment status';
  }
}

export const payHereService = new PayHereService();
