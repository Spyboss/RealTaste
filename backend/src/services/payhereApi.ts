import axios from 'axios';
import { config } from '../config';

export interface PayHereApiPaymentRequest {
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
}

export interface PayHereApiPaymentResponse {
  status: number;
  msg: string;
  data: {
    payment_id: string;
    checkout_url: string;
  };
}

export interface PayHereApiTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export class PayHereApiService {
  private appId: string;
  private appSecret: string;
  private baseUrl: string;
  private backendUrl: string;

  constructor() {
    this.appId = config.payhere.apiAppId;
    this.appSecret = config.payhere.apiAppSecret;
    this.baseUrl = config.payhere.sandbox 
      ? 'https://sandbox.payhere.lk/merchant/v1'
      : 'https://www.payhere.lk/merchant/v1';
    this.backendUrl = config.payhere.backendUrl;

    console.log('🔑 PayHere API Configuration:');
    console.log(`   App ID: ${this.appId}`);
    console.log(`   Base URL: ${this.baseUrl}`);
    console.log(`   Backend URL: ${this.backendUrl}`);
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    try {
      // Create authorization header (Base64 encoded appId:appSecret)
      const credentials = Buffer.from(`${this.appId}:${this.appSecret}`).toString('base64');
      
      const response = await axios.post<PayHereApiTokenResponse>(
        `${this.baseUrl}/oauth/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('✅ PayHere API token obtained');
      return response.data.access_token;
    } catch (error: any) {
      console.error('❌ Failed to get PayHere API token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with PayHere API');
    }
  }

  /**
   * Create payment using PayHere API
   */
  async createPayment(
    orderId: string,
    amount: number,
    customerName: string,
    customerPhone: string,
    customerEmail: string = 'customer@realtaste.lk'
  ): Promise<{ checkoutUrl: string; paymentId: string }> {
    try {
      // Get access token
      const accessToken = await this.getAccessToken();

      // Prepare payment data
      const amountStr = amount.toFixed(2);
      const nameParts = customerName.trim().split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || 'RealTaste';

      const paymentData: PayHereApiPaymentRequest = {
        merchant_id: config.payhere.merchantId,
        return_url: `${this.backendUrl}/api/payments/return`,
        cancel_url: `${this.backendUrl}/api/payments/cancel`,
        notify_url: `${this.backendUrl}/api/payments/webhook`,
        order_id: orderId,
        items: 'RealTaste Food Order',
        currency: 'LKR',
        amount: amountStr,
        first_name: firstName,
        last_name: lastName,
        email: customerEmail,
        phone: customerPhone,
        address: 'Colombo',
        city: 'Colombo',
        country: 'Sri Lanka'
      };

      console.log(`💳 Creating PayHere API payment for Order ${orderId}:`);
      console.log(`   Amount: LKR ${amountStr}`);
      console.log(`   Using API authentication`);

      // Create payment via API
      const response = await axios.post<PayHereApiPaymentResponse>(
        `${this.baseUrl}/payment/checkout`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 1 && response.data.data) {
        console.log('✅ PayHere API payment created successfully');
        console.log(`   Payment ID: ${response.data.data.payment_id}`);
        console.log(`   Checkout URL: ${response.data.data.checkout_url}`);

        return {
          checkoutUrl: response.data.data.checkout_url,
          paymentId: response.data.data.payment_id
        };
      } else {
        throw new Error(`PayHere API error: ${response.data.msg}`);
      }

    } catch (error: any) {
      console.error('❌ PayHere API payment creation failed:', error.response?.data || error.message);
      throw new Error('Failed to create PayHere API payment');
    }
  }
}

export const payHereApiService = new PayHereApiService();
