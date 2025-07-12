import { Router } from 'express';
import { supabaseAdmin, tables } from '../services/supabase';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth';
import { validate, schemas, validateQuery, querySchemas } from '../middleware/validation';
import { orderLimiter, adminLimiter } from '../middleware/rateLimiter';
import { ApiResponse, Order, CreateOrderRequest, generateOrderId } from '../types/shared';
import { payHereService } from '../services/payhere';
import { deliveryService } from '../services/deliveryService';
import { validateCoordinates } from '../utils/geoUtils';

const router = Router();

// POST /api/orders - Create new order
router.post('/',
  optionalAuth, // Optional auth for guest orders
  orderLimiter,
  validate(schemas.createOrder),
  async (req, res) => {
    try {
      const orderData: CreateOrderRequest = req.body;

      // Validate delivery data if order type is delivery
      if (orderData.order_type === 'delivery') {
        if (!orderData.delivery_address) {
          return res.status(400).json({
            success: false,
            error: 'Delivery address is required for delivery orders'
          });
        }

        if (!orderData.delivery_latitude || !orderData.delivery_longitude) {
          return res.status(400).json({
            success: false,
            error: 'Delivery coordinates are required for delivery orders'
          });
        }

        if (!validateCoordinates(orderData.delivery_latitude, orderData.delivery_longitude)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid delivery coordinates'
          });
        }
      }

      // Calculate order totals
      let subtotal = 0;
      let deliveryFee = 0;
      const orderItems = [];

      for (const item of orderData.items) {
        // Get menu item details
        const { data: menuItem, error: menuError } = await supabaseAdmin
          .from(tables.menu_items)
          .select(`
            *,
            menu_variants(*),
            menu_addons(*)
          `)
          .eq('id', item.menu_item_id)
          .eq('is_available', true)
          .single();

        if (menuError || !menuItem) {
          return res.status(400).json({
            success: false,
            error: `Menu item not found or unavailable: ${item.menu_item_id}`
          });
        }

        let itemPrice = menuItem.base_price;

        // Add variant price modifier
        if (item.variant_id) {
          const variant = menuItem.menu_variants?.find((v: any) => v.id === item.variant_id);
          if (!variant || !variant.is_available) {
            return res.status(400).json({
              success: false,
              error: `Variant not found or unavailable: ${item.variant_id}`
            });
          }
          itemPrice += variant.price_modifier;
        }

        // Calculate addon prices
        let addonTotal = 0;
        const itemAddons = [];

        if (item.addon_ids && item.addon_ids.length > 0) {
          for (const addonId of item.addon_ids) {
            const addon = menuItem.menu_addons?.find((a: any) => a.id === addonId);
            if (!addon || !addon.is_available) {
              return res.status(400).json({
                success: false,
                error: `Addon not found or unavailable: ${addonId}`
              });
            }
            addonTotal += addon.price;
            itemAddons.push({
              addon_id: addonId,
              quantity: 1,
              unit_price: addon.price,
              total_price: addon.price
            });
          }
        }

        const totalItemPrice = (itemPrice + addonTotal) * item.quantity;
        subtotal += totalItemPrice;

        orderItems.push({
          menu_item_id: item.menu_item_id,
          variant_id: item.variant_id || null,
          quantity: item.quantity,
          unit_price: itemPrice + addonTotal,
          total_price: totalItemPrice,
          notes: item.notes || null,
          addons: itemAddons
        });
      }

      // Calculate delivery fee if order type is delivery
      if (orderData.order_type === 'delivery') {
        const restaurantLat = parseFloat(process.env.VITE_RESTAURANT_LAT || '6.261449');
    const restaurantLng = parseFloat(process.env.VITE_RESTAURANT_LNG || '80.906462');
        
        const deliveryCalculation = await deliveryService.calculateDeliveryFee(
          restaurantLat,
          restaurantLng,
          orderData.delivery_latitude as number,
          orderData.delivery_longitude as number
        );

        if (!deliveryCalculation.isWithinRange) {
          return res.status(400).json({
            success: false,
            error: `Delivery location is outside our ${await deliveryService.getDeliverySettings().then(s => s.max_delivery_range_km)}km delivery range`
          });
        }

        deliveryFee = deliveryCalculation.deliveryFee;
      }

      // Calculate tax (assuming 0% for now, can be configured)
      const taxRate = 0;
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount + deliveryFee;

      // Ensure user exists in users table if authenticated
      if (req.user?.id) {
        const { data: existingUser, error: userCheckError } = await supabaseAdmin
          .from(tables.users)
          .select('id')
          .eq('id', req.user.id)
          .single();

        if (userCheckError && userCheckError.code === 'PGRST116') {
          // User doesn't exist, create them
          console.log('Creating user record for:', req.user.id);
          const { error: createUserError } = await supabaseAdmin
            .from(tables.users)
            .insert({
              id: req.user.id,
              email: req.user.email,
              role: 'customer'
            });

          if (createUserError) {
            console.error('Error creating user:', createUserError);
            // Continue with guest order if user creation fails
            req.user = undefined;
          }
        }
      }

      // Create order
      const orderInsertData: any = {
        customer_id: req.user?.id || null,
        customer_phone: orderData.customer_phone,
        customer_name: orderData.customer_name || null,
        status: 'received',
        payment_method: orderData.payment_method,
        payment_status: orderData.payment_method === 'cash' ? 'pending' : 'pending',
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: orderData.notes || null,
        order_type: orderData.order_type || 'pickup',
        delivery_fee: deliveryFee
      };

      // Add delivery-specific fields if order type is delivery
      if (orderData.order_type === 'delivery') {
        orderInsertData.delivery_address = orderData.delivery_address;
        orderInsertData.delivery_latitude = orderData.delivery_latitude;
        orderInsertData.delivery_longitude = orderData.delivery_longitude;
        orderInsertData.delivery_notes = orderData.delivery_notes || null;
        orderInsertData.customer_gps_location = orderData.customer_gps_location || null;
        
        // Calculate delivery distance
        const restaurantLat = parseFloat(process.env.VITE_RESTAURANT_LAT || '6.261449');
    const restaurantLng = parseFloat(process.env.VITE_RESTAURANT_LNG || '80.906462');
        const deliveryCalculation = await deliveryService.calculateDeliveryFee(
          restaurantLat,
          restaurantLng,
          orderData.delivery_latitude as number,
          orderData.delivery_longitude as number
        );
        orderInsertData.delivery_distance_km = deliveryCalculation.distance;
        
        // Set estimated delivery time
        const estimatedDeliveryTime = new Date();
        estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + deliveryCalculation.estimatedTime + 30); // 30 min prep time
        orderInsertData.estimated_delivery_time = estimatedDeliveryTime.toISOString();
      }

      const { data: order, error: orderError } = await supabaseAdmin
        .from(tables.orders)
        .insert(orderInsertData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      for (const item of orderItems) {
        const { addons, ...itemData } = item; // Separate addons from item data

        const { data: orderItem, error: itemError } = await supabaseAdmin
          .from(tables.order_items)
          .insert({
            order_id: order.id,
            ...itemData
          })
          .select()
          .single();

        if (itemError) throw itemError;

        // Create order item addons
        for (const addon of addons) {
          const { error: addonError } = await supabaseAdmin
            .from(tables.order_item_addons)
            .insert({
              order_item_id: orderItem.id,
              ...addon
            });

          if (addonError) throw addonError;
        }
      }

      // Create delivery time slot for delivery orders
      if (orderData.order_type === 'delivery') {
        try {
          await deliveryService.createDeliveryTimeSlot(
            order.id,
            30, // 30 minutes prep time
            20  // 20 minutes delivery time
          );
        } catch (error) {
          console.error('Error creating delivery time slot:', error);
          // Don't fail the order creation if time slot creation fails
        }
      }

      // Fetch complete order with items
      const { data: completeOrder, error: fetchError } = await supabaseAdmin
        .from(tables.orders)
        .select(`
          *,
          order_items (
            *,
            menu_item:menu_items(*),
            variant:menu_variants(*),
            order_item_addons (
              *,
              addon:menu_addons(*)
            )
          )
        `)
        .eq('id', order.id)
        .single();

      if (fetchError) throw fetchError;

      // Handle different payment methods
      if (orderData.payment_method === 'card') {
        // For card payments, use PayHere JavaScript SDK method
        const paymentData = payHereService.createPaymentData(
          completeOrder.id,
          completeOrder.total_amount,
          completeOrder.customer_name || 'Customer',
          completeOrder.customer_phone
        );

        const response: ApiResponse<{
          order: Order;
          payment: {
            paymentData: typeof paymentData;
          };
        }> = {
          success: true,
          data: {
            order: completeOrder,
            payment: {
              paymentData
            }
          },
          message: 'Order created successfully. Proceed to payment.'
        };

        res.status(201).json(response);
      } else {
        // For cash payments, return order normally
        const response: ApiResponse<Order> = {
          success: true,
          data: completeOrder,
          message: 'Order created successfully'
        };

        res.status(201).json(response);
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      console.error('Error details:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace',
        orderData: JSON.stringify(req.body, null, 2)
      });
      res.status(500).json({
        success: false,
        error: 'Failed to create order',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      });
    }
  }
);

// GET /api/orders - Get orders (admin: all orders, user: their orders)
router.get('/',
  authenticateToken,
  validateQuery(querySchemas.pagination.concat(querySchemas.orderFilters)),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let query = supabaseAdmin
        .from(tables.orders)
        .select(`
          *,
          order_items (
            *,
            menu_item:menu_items(*),
            variant:menu_variants(*),
            order_item_addons (
              *,
              addon:menu_addons(*)
            )
          )
        `, { count: 'exact' });

      // If not admin, only show user's orders
      if (req.user?.role !== 'admin') {
        query = query.eq('customer_id', req.user?.id);
      }

      // Apply status filter if provided
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + Number(limit) - 1);

      if (error) throw error;

      const response: ApiResponse<{orders: Order[], total: number, page: number, limit: number}> = {
        success: true,
        data: {
          orders: data || [],
          total: count || 0,
          page: Number(page),
          limit: Number(limit)
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders'
      });
    }
  }
);

// GET /api/orders/:id - Get specific order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    let query = supabaseAdmin
      .from(tables.orders)
      .select(`
        *,
        order_items (
          *,
          menu_item:menu_items(*),
          variant:menu_variants(*),
          order_item_addons (
            *,
            addon:menu_addons(*)
          )
        )
      `)
      .eq('id', req.params.id);

    // If not admin, only allow access to own orders
    if (req.user?.role !== 'admin') {
      query = query.eq('customer_id', req.user?.id);
    }

    const { data, error } = await query.single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const response: ApiResponse<Order> = {
      success: true,
      data
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
});

// PATCH /api/orders/:id/cancel - Cancel order (customer only)
router.patch('/:id/cancel',
  authenticateToken,
  orderLimiter,
  async (req, res) => {
    try {
      // First, get the order to check ownership and current status
      let query = supabaseAdmin
        .from(tables.orders)
        .select('*')
        .eq('id', req.params.id);

      // If not admin, only allow access to own orders
      if (req.user?.role !== 'admin') {
        query = query.eq('customer_id', req.user?.id);
      }

      const { data: existingOrder, error: fetchError } = await query.single();

      if (fetchError || !existingOrder) {
        return res.status(404).json({
          success: false,
          error: 'Order not found or you do not have permission to cancel this order'
        });
      }

      // Check if order can be cancelled
      const cancellableStatuses = ['received', 'confirmed'];
      if (!cancellableStatuses.includes(existingOrder.status)) {
        return res.status(400).json({
          success: false,
          error: `Order cannot be cancelled. Current status: ${existingOrder.status}. Orders can only be cancelled when they are 'received' or 'confirmed'.`
        });
      }

      // Update order status to cancelled
      const { data, error } = await supabaseAdmin
        .from(tables.orders)
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;

      const response: ApiResponse<Order> = {
        success: true,
        data,
        message: 'Order cancelled successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel order'
      });
    }
  }
);

// PATCH /api/orders/:id/status - Update order status (admin only)
router.patch('/:id/status',
  authenticateToken,
  requireAdmin,
  adminLimiter,
  validate(schemas.updateOrderStatus),
  async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from(tables.orders)
        .update({
          status: req.body.status,
          estimated_pickup_time: req.body.estimated_pickup_time || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;

      const response: ApiResponse<Order> = {
        success: true,
        data,
        message: 'Order status updated successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update order status'
      });
    }
  }
);

export default router;
