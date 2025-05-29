import { Router } from 'express';
import { supabaseAdmin, tables, triggerOrderStatusUpdate } from '../services/supabase';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { adminLimiter } from '../middleware/rateLimiter';
import { ApiResponse, DailyStats, PopularItem } from '../types/shared';

const router = Router();

// GET /api/admin/dashboard - Get dashboard stats
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { timeframe = 'today' } = req.query;

    // Calculate date ranges based on timeframe
    const now = new Date();
    let startDate: string, endDate: string;

    switch (timeframe) {
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        startDate = weekStart.toISOString();
        endDate = now.toISOString();
        break;
      case 'month':
        const monthStart = new Date(now);
        monthStart.setDate(now.getDate() - 30);
        startDate = monthStart.toISOString();
        endDate = now.toISOString();
        break;
      case 'today':
      default:
        const today = new Date().toISOString().split('T')[0];
        startDate = `${today}T00:00:00.000Z`;
        endDate = `${today}T23:59:59.999Z`;
    }

    // Get orders for the timeframe
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from(tables.orders)
      .select(`
        *,
        order_items (
          quantity,
          price,
          menu_item:menu_items(name)
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (ordersError) throw ordersError;

    // Get pending orders (received + preparing) - always current
    const { data: pendingOrders, error: pendingError } = await supabaseAdmin
      .from(tables.orders)
      .select(`
        *,
        order_items (
          *,
          menu_item:menu_items(name),
          variant:menu_variants(name),
          order_item_addons (
            *,
            addon:menu_addons(name)
          )
        )
      `)
      .in('status', ['received', 'preparing'])
      .order('created_at', { ascending: true });

    if (pendingError) throw pendingError;

    // Calculate stats for the timeframe
    const totalOrders = orders?.length || 0;
    const completedOrders = orders?.filter(order => order.status === 'picked_up') || [];
    const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate hourly data for charts (last 24 hours for today, daily for week/month)
    const chartData = [];
    if (timeframe === 'today') {
      // Hourly data for today
      for (let hour = 0; hour < 24; hour++) {
        const hourStart = new Date(startDate);
        hourStart.setHours(hour, 0, 0, 0);
        const hourEnd = new Date(startDate);
        hourEnd.setHours(hour, 59, 59, 999);

        const hourOrders = orders?.filter(order => {
          const orderTime = new Date(order.created_at);
          return orderTime >= hourStart && orderTime <= hourEnd;
        }) || [];

        chartData.push({
          label: `${hour}:00`,
          orders: hourOrders.length,
          revenue: hourOrders.reduce((sum, order) => sum + Number(order.total_amount), 0)
        });
      }
    } else {
      // Daily data for week/month
      const days = timeframe === 'week' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const dayStart = new Date(now);
        dayStart.setDate(now.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        const dayOrders = orders?.filter(order => {
          const orderTime = new Date(order.created_at);
          return orderTime >= dayStart && orderTime <= dayEnd;
        }) || [];

        chartData.push({
          label: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0)
        });
      }
    }

    // Get popular items from the timeframe
    const itemCounts: { [key: string]: { name: string; count: number; revenue: number } } = {};

    orders?.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const itemName = item.menu_item?.name || 'Unknown Item';
        if (!itemCounts[itemName]) {
          itemCounts[itemName] = { name: itemName, count: 0, revenue: 0 };
        }
        itemCounts[itemName].count += item.quantity;
        itemCounts[itemName].revenue += Number(item.price) * item.quantity;
      });
    });

    const popularItems = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate average preparation time
    const completedOrdersWithTimes = completedOrders.filter(order =>
      order.estimated_pickup_time && order.created_at
    );

    const avgPrepTime = completedOrdersWithTimes.length > 0
      ? completedOrdersWithTimes.reduce((sum, order) => {
          const created = new Date(order.created_at).getTime();
          const pickup = new Date(order.estimated_pickup_time).getTime();
          return sum + (pickup - created);
        }, 0) / completedOrdersWithTimes.length / (1000 * 60) // Convert to minutes
      : 0;

    const dashboardData = {
      timeframe,
      stats: {
        total_orders: totalOrders,
        completed_orders: completedOrders.length,
        total_revenue: totalRevenue,
        avg_order_value: avgOrderValue,
        avg_prep_time: Math.round(avgPrepTime),
        popular_items: popularItems
      },
      chart_data: chartData,
      pending_orders: pendingOrders || [],
      queue_length: pendingOrders?.length || 0
    };

    const response: ApiResponse<typeof dashboardData> = {
      success: true,
      data: dashboardData
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

// GET /api/admin/analytics - Get analytics data
router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysCount = Math.min(Number(days), 30); // Max 30 days

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysCount);

    const { data: orders, error } = await supabaseAdmin
      .from(tables.orders)
      .select(`
        *,
        order_items (
          *,
          menu_item:menu_items(name)
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('payment_status', 'completed');

    if (error) throw error;

    // Group orders by date
    const dailyStats = new Map<string, DailyStats>();

    // Initialize all dates with zero values
    for (let i = 0; i < daysCount; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      dailyStats.set(dateStr, {
        date: dateStr,
        total_orders: 0,
        total_revenue: 0,
        avg_order_value: 0,
        popular_items: []
      });
    }

    // Aggregate order data
    const itemStats = new Map<string, Map<string, PopularItem>>();

    orders?.forEach(order => {
      const orderDate = order.created_at.split('T')[0];
      const dayStats = dailyStats.get(orderDate);

      if (dayStats) {
        dayStats.total_orders += 1;
        dayStats.total_revenue += order.total_amount;

        // Track items for this date
        if (!itemStats.has(orderDate)) {
          itemStats.set(orderDate, new Map());
        }
        const dayItems = itemStats.get(orderDate)!;

        order.order_items?.forEach((item: any) => {
          const itemId = item.menu_item_id;
          if (dayItems.has(itemId)) {
            const existing = dayItems.get(itemId)!;
            existing.quantity_sold += item.quantity;
            existing.revenue += item.total_price;
          } else {
            dayItems.set(itemId, {
              menu_item_id: itemId,
              menu_item_name: item.menu_item?.name || 'Unknown',
              quantity_sold: item.quantity,
              revenue: item.total_price
            });
          }
        });
      }
    });

    // Calculate averages and popular items
    dailyStats.forEach((stats, date) => {
      if (stats.total_orders > 0) {
        stats.avg_order_value = stats.total_revenue / stats.total_orders;
      }

      const dayItems = itemStats.get(date);
      if (dayItems) {
        stats.popular_items = Array.from(dayItems.values())
          .sort((a, b) => b.quantity_sold - a.quantity_sold)
          .slice(0, 3);
      }
    });

    const analyticsData = Array.from(dailyStats.values()).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const response: ApiResponse<DailyStats[]> = {
      success: true,
      data: analyticsData
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data'
    });
  }
});

// GET /api/admin/orders/queue - Get current order queue
router.get('/orders/queue', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(tables.orders)
      .select(`
        *,
        order_items (
          *,
          menu_item:menu_items(name),
          variant:menu_variants(name),
          order_item_addons (
            *,
            addon:menu_addons(name)
          )
        )
      `)
      .in('status', ['received', 'preparing'])
      .order('created_at', { ascending: true });

    if (error) throw error;

    const response: ApiResponse<typeof data> = {
      success: true,
      data: data || []
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching order queue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order queue'
    });
  }
});

// PATCH /api/admin/orders/bulk-update - Bulk update order statuses
router.patch('/orders/bulk-update',
  authenticateToken,
  requireAdmin,
  adminLimiter,
  async (req, res) => {
    try {
      const { orderIds, status, estimated_pickup_time } = req.body;

      if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Order IDs array is required'
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required'
        });
      }

      const updateData: Record<string, any> = {
        status,
        updated_at: new Date().toISOString()
      };

      if (estimated_pickup_time) {
        updateData.estimated_pickup_time = estimated_pickup_time;
      }

      const { data, error } = await supabaseAdmin
        .from(tables.orders)
        .update(updateData)
        .in('id', orderIds)
        .select();

      if (error) throw error;

      const response: ApiResponse<typeof data> = {
        success: true,
        data: data || [],
        message: `${orderIds.length} orders updated successfully`
      };

      res.json(response);
    } catch (error) {
      console.error('Error bulk updating orders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to bulk update orders'
      });
    }
  }
);

// ORDER MANAGEMENT APIs

// PATCH /api/admin/orders/:id/assign - Assign order to staff member
router.patch('/orders/:id/assign', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { staff_id } = req.body;

    if (!staff_id) {
      return res.status(400).json({
        success: false,
        error: 'Staff ID is required'
      });
    }

    const { data, error } = await supabaseAdmin
      .from(tables.orders)
      .update({
        staff_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    const response: ApiResponse<typeof data> = {
      success: true,
      data: data?.[0] || null,
      message: 'Order assigned successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Error assigning order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign order'
    });
  }
});

// PATCH /api/admin/orders/:id/priority - Update order priority
router.patch('/orders/:id/priority', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!priority || !['urgent', 'normal', 'low'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Valid priority is required (urgent, normal, low)'
      });
    }

    const { data, error } = await supabaseAdmin
      .from(tables.orders)
      .update({
        priority,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    const response: ApiResponse<typeof data> = {
      success: true,
      data: data?.[0] || null,
      message: 'Order priority updated successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating order priority:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order priority'
    });
  }
});

// ANALYTICS ENDPOINTS

// GET /api/admin/analytics/daily - Get daily summary
router.get('/analytics/daily', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid date format' });
    }

    const dateStr = targetDate.toISOString().split('T')[0];
    const startDate = `${dateStr}T00:00:00.000Z`;
    const endDate = `${dateStr}T23:59:59.999Z`;

    // Fetch orders for this day
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from(tables.orders)
      .select('id, total_amount, created_at, payment_status')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('payment_status', 'completed');

    if (ordersError) throw ordersError;

    const total_orders = orders.length;
    const total_revenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const avg_order_value = total_orders > 0 ? total_revenue / total_orders : 0;

    const dailyData = {
      date: dateStr,
      total_orders,
      total_revenue,
      avg_order_value
    };

    const response: ApiResponse<typeof dailyData> = {
      success: true,
      data: dailyData
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching daily analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch daily analytics' });
  }
});

// GET /api/admin/analytics/items - Get top-selling items
router.get('/analytics/items', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { days = 1 } = req.query;
    const daysCount = Math.min(Number(days), 30); // Max 30 days

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysCount + 1); // including today
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Fetch orders and their items for the period
    const { data: orderItems, error: ordersError } = await supabaseAdmin
      .from(tables.order_items)
      .select(`
        quantity,
        unit_price,
        total_price,
        menu_item:menu_items(name),
        order:orders!inner(created_at, payment_status)
      `)
      .gte('order.created_at', startDate.toISOString())
      .lte('order.created_at', endDate.toISOString())
      .eq('order.payment_status', 'completed');

    if (ordersError) throw ordersError;

    // Aggregate items
    const itemMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

    orderItems.forEach(item => {
      const itemName = item.menu_item?.name || 'Unknown';
      if (!itemMap[itemName]) {
        itemMap[itemName] = { name: itemName, quantity: 0, revenue: 0 };
      }
      itemMap[itemName].quantity += item.quantity;
      itemMap[itemName].revenue += item.total_price;
    });

    const itemsArray = Object.values(itemMap);
    itemsArray.sort((a, b) => b.quantity - a.quantity); // descending by quantity

    const response: ApiResponse<typeof itemsArray> = {
      success: true,
      data: itemsArray
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching top items:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top items' });
  }
});

// GET /api/admin/analytics/trends - Get historical trends
router.get('/analytics/trends', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysCount = Math.min(Number(days), 365); // Max 1 year

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysCount);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Fetch orders for the period
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from(tables.orders)
      .select('id, total_amount, created_at, payment_status')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('payment_status', 'completed');

    if (ordersError) throw ordersError;

    // Group orders by date
    const trendsMap: Record<string, { date: string; orders: number; revenue: number }> = {};

    // Initialize all dates with zero values
    for (let i = 0; i <= daysCount; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      trendsMap[dateStr] = { date: dateStr, orders: 0, revenue: 0 };
    }

    // Aggregate data
    orders.forEach(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      if (trendsMap[orderDate]) {
        trendsMap[orderDate].orders += 1;
        trendsMap[orderDate].revenue += order.total_amount;
      }
    });

    const trendsData = Object.values(trendsMap).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const response: ApiResponse<typeof trendsData> = {
      success: true,
      data: trendsData
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch trends data' });
  }
});

// GET /api/admin/queue - Get order queue with filters
router.get('/queue', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, staff_id } = req.query;
    const statuses = status ? (status as string).split(',') : ['received', 'preparing'];

    let query = supabaseAdmin
      .from(tables.orders)
      .select(`
        *,
        order_items (
          *,
          menu_item:menu_items(name),
          variant:menu_variants(name),
          order_item_addons (
            *,
            addon:menu_addons(name)
          )
        )
      `)
      .in('status', statuses)
      .order('created_at', { ascending: true });

    if (staff_id) {
      query = query.eq('staff_id', staff_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    const response: ApiResponse<typeof data> = {
      success: true,
      data: data || []
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching order queue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order queue'
    });
  }
});

// GET /api/admin/orders - Get all orders with filtering options
router.get('/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, startDate, endDate, customerPhone } = req.query;

    let query = supabaseAdmin
      .from(tables.orders)
      .select(`
        *,
        order_items (
          *,
          menu_item:menu_items(name),
          variant:menu_variants(name),
          order_item_addons (
            *,
            addon:menu_addons(name)
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (status) {
      query = query.eq('status', status);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    if (customerPhone) {
      query = query.eq('customer_phone', customerPhone);
    }

    const { data, error } = await query;

    if (error) throw error;

    const response: ApiResponse<typeof data> = {
      success: true,
      data: data || []
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// GET /api/admin/orders/:id - Get order details
router.get('/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
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
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      throw error;
    }

    const response: ApiResponse<typeof data> = {
      success: true,
      data: data || {}
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order details'
    });
  }
});

// PATCH /api/admin/orders/:id/status - Update order status
router.patch('/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, estimated_pickup_time } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const updateData: Record<string, any> = {
      status,
      updated_at: new Date().toISOString()
    };

    if (estimated_pickup_time) {
      updateData.estimated_pickup_time = estimated_pickup_time;
    }

    const { data, error } = await supabaseAdmin
      .from(tables.orders)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      throw error;
    }

    const response: ApiResponse<typeof data> = {
      success: true,
      data: data || {},
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
});

// DELETE /api/admin/orders/:id - Delete an order
router.delete('/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from(tables.orders)
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      throw error;
    }

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id },
      message: 'Order deleted successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete order'
    });
  }
});

// ORDER QUEUE MANAGEMENT APIs

// GET /api/admin/orders/queue - Get current order queue (already implemented)

// PATCH /api/admin/orders/queue/reorder - Reorder items in the queue
router.patch('/orders/queue/reorder', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order IDs array is required'
      });
    }

    // Update the orders with their new positions
    const updatePromises = orderIds.map((orderId, index) => {
      return supabaseAdmin
        .from(tables.orders)
        .update({
          queue_position: index,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
    });

    // Execute all updates
    const results = await Promise.all(updatePromises);

    // Check for any errors in the updates
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      throw new Error('Some orders could not be updated');
    }

    // Trigger real-time updates
    await triggerOrderStatusUpdate(orderIds.join(','));

    const response: ApiResponse<{ orderIds: string[] }> = {
      success: true,
      data: { orderIds },
      message: 'Order queue reordered successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Error reordering queue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reorder queue'
    });
  }
});

// DELETE /api/admin/orders/queue/remove - Remove items from the queue
router.delete('/orders/queue/remove', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order IDs array is required'
      });
    }

    const { error } = await supabaseAdmin
      .from(tables.orders)
      .update({ status: 'cancelled', queue_position: null })
      .in('id', orderIds);

    if (error) throw error;

    const response: ApiResponse<{ orderIds: string[] }> = {
      success: true,
      data: { orderIds },
      message: 'Orders removed from queue successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Error removing orders from queue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove orders from queue'
    });
  }
});

// ANALYTICS/REPORTING ENDPOINTS

// GET /api/admin/sales - Get sales data
router.get('/sales', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = supabaseAdmin
      .from(tables.orders)
      .select('total_amount, created_at')
      .eq('payment_status', 'completed');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate total sales
    const totalSales = data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

    // Group sales by date
    const salesByDate = new Map<string, number>();

    data?.forEach(order => {
      const date = order.created_at.split('T')[0];
      if (!salesByDate.has(date)) {
        salesByDate.set(date, 0);
      }
      salesByDate.set(date, salesByDate.get(date)! + Number(order.total_amount));
    });

    const salesData = {
      total_sales: totalSales,
      sales_by_date: Array.from(salesByDate.entries()).map(([date, amount]) => ({
        date,
        amount
      }))
    };

    const response: ApiResponse<typeof salesData> = {
      success: true,
      data: salesData
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales data'
    });
  }
});

// GET /api/admin/orders/stats - Get order statistics
router.get('/orders/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabaseAdmin
      .from(tables.orders)
      .select('status, created_at');

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate order statistics
    const statusCounts: { [key: string]: number } = {};
    const ordersByDate: { [key: string]: number } = {};

    data?.forEach(order => {
      // Count orders by status
      if (!statusCounts[order.status]) {
        statusCounts[order.status] = 0;
      }
      statusCounts[order.status]!++;

      // Count orders by date
      const date = order.created_at.split('T')[0];
      if (!ordersByDate[date]) {
        ordersByDate[date] = 0;
      }
      ordersByDate[date]++;
    });

    const orderStats = {
      total_orders: data?.length || 0,
      orders_by_status: statusCounts,
      orders_by_date: Object.entries(ordersByDate).map(([date, count]) => ({
        date,
        count
      }))
    };

    const response: ApiResponse<typeof orderStats> = {
      success: true,
      data: orderStats
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order statistics'
    });
  }
});

// GET /api/admin/customers/stats - Get customer analytics
router.get('/customers/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysCount = Math.min(Number(days), 90); // Max 90 days

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysCount);

    // Get orders in the date range
    const { data: orders, error } = await supabaseAdmin
      .from(tables.orders)
      .select('customer_phone, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    // Track customer orders
    const customerOrders: { [key: string]: number } = {};

    orders?.forEach(order => {
      const phone = order.customer_phone;
      if (phone) {
        if (!customerOrders[phone]) {
          customerOrders[phone] = 0;
        }
        customerOrders[phone]++;
      }
    });

    // Get top customers
    const topCustomers = Object.entries(customerOrders)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([phone, count]) => ({
        customer_phone: phone,
        order_count: count
      }));

    // Calculate repeat customer rate
    const totalCustomers = Object.keys(customerOrders).length;
    const repeatCustomers = Object.values(customerOrders).filter(count => count > 1).length;
    const repeatCustomerRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    const customerStats = {
      top_customers: topCustomers,
      total_customers: totalCustomers,
      repeat_customers: repeatCustomers,
      repeat_customer_rate: repeatCustomerRate
    };

    const response: ApiResponse<typeof customerStats> = {
      success: true,
      data: customerStats
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer analytics'
    });
  }
});

// POST /api/admin/orders/status-update - Trigger order status update
router.post('/orders/status-update', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }

    const result = await triggerOrderStatusUpdate(orderId);

    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'Failed to trigger order status update'
      });
    }

    const response: ApiResponse<{ orderId: string }> = {
      success: true,
      data: { orderId },
      message: 'Order status update triggered successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Error triggering order status update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger order status update'
    });
  }
});

// GET /api/admin/daily-summary - Get daily analytics summary
router.get('/daily-summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();

    const dateStr = targetDate.toISOString().split('T')[0];
    const startDate = `${dateStr}T00:00:00.000Z`;
    const endDate = `${dateStr}T23:59:59.999Z`;

    // Fetch orders for this day
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from(tables.orders)
      .select('id, total_amount, created_at, payment_status, status')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('payment_status', 'completed');

    if (ordersError) throw ordersError;

    const total_orders = orders.length;
    const total_revenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const avg_order_value = total_orders > 0 ? total_revenue / total_orders : 0;
    const completed_orders = orders.filter(o => o.status === 'completed').length;

    const dailyData = {
      date: dateStr,
      total_orders,
      total_revenue,
      avg_order_value,
      completed_orders
    };

    const response: ApiResponse<typeof dailyData> = {
      success: true,
      data: dailyData
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily summary'
    });
  }
});

// GET /api/admin/top-items - Get top selling items
router.get('/top-items', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysCount = Math.min(Number(days), 30);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysCount);

    const { data: orderItems, error } = await supabaseAdmin
      .from(tables.order_items)
      .select(`
        quantity,
        unit_price,
        total_price,
        menu_item:menu_items(name),
        order:orders!inner(created_at, payment_status)
      `)
      .gte('order.created_at', startDate.toISOString())
      .lte('order.created_at', endDate.toISOString())
      .eq('order.payment_status', 'completed');

    if (error) throw error;

    // Aggregate by menu item
    const itemStats: { [key: string]: { name: string; quantity: number; revenue: number } } = {};

    orderItems?.forEach(item => {
      // Handle the case where menu_item might be an array or object
      const menuItem = Array.isArray(item.menu_item) ? item.menu_item[0] : item.menu_item;
      const name = menuItem?.name || 'Unknown Item';
      if (!itemStats[name]) {
        itemStats[name] = { name, quantity: 0, revenue: 0 };
      }
      itemStats[name].quantity += item.quantity;
      itemStats[name].revenue += item.total_price;
    });

    const topItems = Object.values(itemStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const response: ApiResponse<typeof topItems> = {
      success: true,
      data: topItems
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching top items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top items'
    });
  }
});

// GET /api/admin/trends - Get trends data
router.get('/trends', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysCount = Math.min(Number(days), 30);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysCount);

    const { data: orders, error } = await supabaseAdmin
      .from(tables.orders)
      .select('total_amount, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const dailyStats: { [key: string]: { orders: number; revenue: number } } = {};

    orders?.forEach(order => {
      const date = order.created_at.split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { orders: 0, revenue: 0 };
      }
      dailyStats[date].orders += 1;
      dailyStats[date].revenue += order.total_amount;
    });

    const trendsData = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      orders: stats.orders,
      revenue: stats.revenue
    }));

    const response: ApiResponse<typeof trendsData> = {
      success: true,
      data: trendsData
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching trends data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trends data'
    });
  }
});

// PUT /api/admin/orders/bulk-update - Bulk update order status
router.put('/orders/bulk-update', authenticateToken, requireAdmin, adminLimiter, async (req, res) => {
  try {
    const { orderIds, status } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order IDs array is required'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    // Validate status
    const validStatuses = ['received', 'confirmed', 'preparing', 'ready_for_pickup', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const { data, error } = await supabaseAdmin
      .from(tables.orders)
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .in('id', orderIds)
      .select();

    if (error) throw error;

    const response: ApiResponse<typeof data> = {
      success: true,
      data: data || [],
      message: `${orderIds.length} orders updated successfully`
    };

    res.json(response);
  } catch (error) {
    console.error('Error bulk updating orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update orders'
    });
  }
});

export default router;
