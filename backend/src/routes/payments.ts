import { Router } from 'express';
import { supabaseAdmin, tables } from '../services/supabase';
import { payHereService, PayHereNotification } from '../services/payhere';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { orderLimiter } from '../middleware/rateLimiter';
import { ApiResponse } from '../types/shared';

const router = Router();

// POST /api/payments/initiate - Initiate PayHere payment
router.post('/initiate',
  optionalAuth,
  orderLimiter,
  async (req, res) => {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Order ID is required'
        });
      }

      // Get order details
      const { data: order, error: orderError } = await supabaseAdmin
        .from(tables.orders)
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // Verify order belongs to user (if authenticated)
      if (req.user && order.customer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Check if order is eligible for payment
      if (order.payment_method !== 'card') {
        return res.status(400).json({
          success: false,
          error: 'Order is not set for card payment'
        });
      }

      if (order.payment_status === 'completed') {
        return res.status(400).json({
          success: false,
          error: 'Order is already paid'
        });
      }

      // Create PayHere payment data
      const paymentData = payHereService.createPaymentData(
        order.id,
        order.total_amount,
        order.customer_name || 'Customer',
        order.customer_phone
      );

      const response: ApiResponse<{
        paymentUrl: string;
        paymentData: typeof paymentData;
      }> = {
        success: true,
        data: {
          paymentUrl: payHereService.getPaymentUrl(),
          paymentData
        },
        message: 'Payment initiated successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Error initiating payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initiate payment'
      });
    }
  }
);

// POST /api/payments/webhook - PayHere webhook handler
router.post('/webhook', async (req, res) => {
  try {
    const notification: PayHereNotification = req.body;

    console.log('PayHere webhook received:', notification);

    // Verify notification authenticity
    if (!payHereService.verifyNotification(notification)) {
      console.error('Invalid PayHere notification signature');
      return res.status(400).send('Invalid signature');
    }

    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const isSuccessful = payHereService.isPaymentSuccessful(statusCode);

    // Update order payment status
    const updateData: any = {
      payment_status: isSuccessful ? 'completed' : 'failed',
      updated_at: new Date().toISOString()
    };

    // If payment successful, update order status
    if (isSuccessful) {
      updateData.status = 'received'; // Ensure order is in received status
    }

    const { error: updateError } = await supabaseAdmin
      .from(tables.orders)
      .update(updateData)
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order payment status:', updateError);
      return res.status(500).send('Database update failed');
    }

    console.log(`Order ${orderId} payment status updated to: ${updateData.payment_status}`);

    // Respond to PayHere
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing PayHere webhook:', error);
    res.status(500).send('Webhook processing failed');
  }
});

// GET /api/payments/return - PayHere return URL handler
router.get('/return', async (req, res) => {
  try {
    const { order_id } = req.query;

    if (!order_id) {
      return res.redirect(`${getFrontendUrl()}/payment/error?message=Missing order ID`);
    }

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from(tables.orders)
      .select('payment_status')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return res.redirect(`${getFrontendUrl()}/payment/error?message=Order not found`);
    }

    // Redirect based on payment status
    if (order.payment_status === 'completed') {
      res.redirect(`${getFrontendUrl()}/payment/success?orderId=${order_id}`);
    } else {
      res.redirect(`${getFrontendUrl()}/payment/pending?orderId=${order_id}`);
    }
  } catch (error) {
    console.error('Error handling PayHere return:', error);
    res.redirect(`${getFrontendUrl()}/payment/error?message=Processing error`);
  }
});

// GET /api/payments/cancel - PayHere cancel URL handler
router.get('/cancel', async (req, res) => {
  try {
    const { order_id } = req.query;
    
    if (order_id) {
      // Update order status to cancelled
      await supabaseAdmin
        .from(tables.orders)
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', order_id);
    }

    res.redirect(`${getFrontendUrl()}/payment/cancelled?orderId=${order_id || ''}`);
  } catch (error) {
    console.error('Error handling PayHere cancel:', error);
    res.redirect(`${getFrontendUrl()}/payment/error?message=Cancellation error`);
  }
});

// Helper function to get frontend URL
function getFrontendUrl(): string {
  return process.env.NODE_ENV === 'production'
    ? 'https://realtaste.pages.dev'
    : 'http://localhost:5173';
}

export default router;
