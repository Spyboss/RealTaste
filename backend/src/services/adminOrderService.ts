import { Request, Response } from 'express';
import { supabaseAdmin, tables, triggerOrderStatusUpdate } from './supabase'; // Assuming supabase.ts is in the same directory

// More detailed Order type based on schema.sql
// Ideally, this would be in a shared types file (e.g., shared/src/types/models.ts)
export interface Order {
  id: string; // UUID
  customer_id?: string | null; // UUID, can be null for guest orders
  customer_phone: string;
  customer_name?: string | null;
  order_type: 'pickup' | 'delivery';
  status: 'received' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'ready_for_delivery' | 'picked_up' | 'delivered' | 'completed' | 'cancelled';
  payment_method: 'card' | 'cash';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  subtotal: number; // DECIMAL(10,2)
  tax_amount?: number; // DECIMAL(10,2)
  total_amount: number; // DECIMAL(10,2)
  delivery_fee?: number;
  delivery_address?: string | null;
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
  delivery_distance_km?: number | null;
  estimated_delivery_time?: string | null;
  actual_delivery_time?: string | null;
  delivery_notes?: string | null;
  customer_gps_location?: string | null;
  notes?: string | null;
  estimated_pickup_time?: string | null; // TIMESTAMP WITH TIME ZONE
  created_at: string; // TIMESTAMP WITH TIME ZONE
  updated_at: string; // TIMESTAMP WITH TIME ZONE
  // Potentially include order_items details later if needed for admin list view
  // order_items?: any[]; 
}

// Handler to get all orders for admin
export const getAllOrdersHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabaseAdmin
      .from(tables.orders)
      .select('*') // Select all columns for now
      .order('created_at', { ascending: false }); // Show newest orders first

    if (error) {
      console.error('Error fetching orders:', error);
      throw error; // Let global error handler catch it
    }

    res.json({ success: true, data: data as Order[] });
  } catch (error: any) {
    // The global error handler in server.ts should catch this
    // but as a fallback or for more specific logging:
    console.error('getAllOrdersHandler error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch orders', details: error.message });
  }
};

// Handler to update order status for admin
export const updateOrderStatusHandler = async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.params;
  const { status } = req.body; // Expecting { status: 'new_status' } in body

  if (!orderId || !status) {
    res.status(400).json({ success: false, error: 'Order ID and new status are required.' });
    return;
  }

  const validStatuses: Order['status'][] = ['received', 'confirmed', 'preparing', 'ready_for_pickup', 'ready_for_delivery', 'picked_up', 'delivered', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ success: false, error: `Invalid status value. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from(tables.orders)
      .update({ status: status, updated_at: new Date().toISOString() }) // Also update updated_at manually
      .eq('id', orderId)
      .select()
      .single(); // To get the updated record back

    if (error) {
      console.error('Error updating order status:', error);
      if (error.code === 'PGRST116') { // PostgREST error for no rows found
        res.status(404).json({ success: false, error: 'Order not found.' });
        return;
      }
      throw error;
    }

    if (!data) {
        res.status(404).json({ success: false, error: 'Order not found after update attempt.' });
        return;
    }

    // Trigger realtime update (even though direct DB change should also trigger it via Supabase Realtime)
    // This is more of an explicit signal if needed, or if direct DB events are sometimes missed.
    // The trigger in supabase.ts is for any change, so this might be redundant but harmless.
    await triggerOrderStatusUpdate(orderId);

    res.json({ success: true, message: 'Order status updated successfully.', data: data as Order });
  } catch (error: any) {
    console.error('updateOrderStatusHandler error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update order status', details: error.message });
  }
};

// Keep original functions if they are used elsewhere, or remove if not.
// For now, I'm assuming the *Handler versions are the primary ones for routes.

// export const getAllOrders = async (): Promise<Order[]> => { ... };
// export const updateOrderStatus = async (orderId: string, newStatus: string): Promise<Order | null> => { ... };