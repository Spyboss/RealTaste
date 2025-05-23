import { Router } from 'express';
import { supabaseAdmin, tables } from '../services/supabase';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { adminLimiter } from '../middleware/rateLimiter';
import { ApiResponse, DailyStats, PopularItem } from '../types/shared';

const router = Router();

// GET /api/admin/dashboard - Get dashboard stats
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = `${today}T00:00:00.000Z`;
    const endOfDay = `${today}T23:59:59.999Z`;

    // Get today's orders
    const { data: todayOrders, error: ordersError } = await supabaseAdmin
      .from(tables.orders)
      .select('*')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    if (ordersError) throw ordersError;

    // Get pending orders (received + preparing)
    const { data: pendingOrders, error: pendingError } = await supabaseAdmin
      .from(tables.orders)
      .select('*')
      .in('status', ['received', 'preparing'])
      .order('created_at', { ascending: true });

    if (pendingError) throw pendingError;

    // Calculate today's stats
    const totalOrders = todayOrders?.length || 0;
    const totalRevenue = todayOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get popular items for today
    const { data: popularItemsData, error: popularError } = await supabaseAdmin
      .from('order_items')
      .select(`
        menu_item_id,
        quantity,
        total_price,
        menu_item:menu_items(name),
        order:orders!inner(created_at)
      `)
      .gte('order.created_at', startOfDay)
      .lte('order.created_at', endOfDay);

    if (popularError) throw popularError;

    // Aggregate popular items
    const itemStats = new Map();
    popularItemsData?.forEach((item: any) => {
      const itemId = item.menu_item_id;
      if (itemStats.has(itemId)) {
        const existing = itemStats.get(itemId);
        existing.quantity_sold += item.quantity;
        existing.revenue += item.total_price;
      } else {
        itemStats.set(itemId, {
          menu_item_id: itemId,
          menu_item_name: item.menu_item?.name || 'Unknown',
          quantity_sold: item.quantity,
          revenue: item.total_price
        });
      }
    });

    const popularItems: PopularItem[] = Array.from(itemStats.values())
      .sort((a, b) => b.quantity_sold - a.quantity_sold)
      .slice(0, 5);

    const dashboardData = {
      today: {
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        avg_order_value: avgOrderValue,
        popular_items: popularItems
      },
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

export default router;
