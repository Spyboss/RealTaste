import { supabaseAdmin as supabase } from './supabase';
import { calculateDistance } from '../utils/geoUtils';

export interface DeliverySettings {
  id: string;
  base_fee: number;
  per_km_fee: number;
  max_delivery_distance_km: number;
  min_order_for_delivery: number;
  is_delivery_enabled: boolean;
}

export interface DeliveryCalculation {
  isWithinRange: boolean;
  distance: number;
  deliveryFee: number;
  estimatedTime: number; // in minutes
}

export interface DeliveryTimeSlot {
  id: string;
  order_id: string;
  estimated_prep_time: number;
  estimated_delivery_time: number;
  actual_prep_time?: number;
  actual_delivery_time?: number;
  status: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered';
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

class DeliveryService {
  private static instance: DeliveryService;
  private settings: DeliverySettings | null = null;

  public static getInstance(): DeliveryService {
    if (!DeliveryService.instance) {
      DeliveryService.instance = new DeliveryService();
    }
    return DeliveryService.instance;
  }

  async getDeliverySettings(): Promise<DeliverySettings> {
    if (this.settings) {
      return this.settings;
    }

    const { data, error } = await supabase
      .from('delivery_settings')
      .select('*')
      .single();

    // Default settings to use as fallback
    const defaultSettings = {
      id: 'default',
      base_fee: 180.00, // LKR 180 for first 1km
      per_km_fee: 40.00, // LKR 40 per additional km
      max_delivery_distance_km: 5.0, // 5km maximum
      min_order_for_delivery: 0,
      is_delivery_enabled: true
    };

    if (error) {
      console.error('Error fetching delivery settings:', error);
      // Return default settings if none found
      return defaultSettings;
    }

    // Validate and sanitize the data - use defaults for any undefined/null values
    const validatedSettings: DeliverySettings = {
      id: data.id || defaultSettings.id,
      base_fee: (data.base_fee !== null && data.base_fee !== undefined) ? data.base_fee : defaultSettings.base_fee,
      per_km_fee: (data.per_km_fee !== null && data.per_km_fee !== undefined) ? data.per_km_fee : defaultSettings.per_km_fee,
      max_delivery_distance_km: (data.max_delivery_distance_km !== null && data.max_delivery_distance_km !== undefined) ? data.max_delivery_distance_km : defaultSettings.max_delivery_distance_km,
      min_order_for_delivery: (data.min_order_for_delivery !== null && data.min_order_for_delivery !== undefined) ? data.min_order_for_delivery : defaultSettings.min_order_for_delivery,
      is_delivery_enabled: (data.is_delivery_enabled !== null && data.is_delivery_enabled !== undefined) ? data.is_delivery_enabled : defaultSettings.is_delivery_enabled
    };

    console.log('Delivery settings loaded:', validatedSettings);
    this.settings = validatedSettings;
    return validatedSettings;
  }

  async updateDeliverySettings(settings: Partial<DeliverySettings>): Promise<DeliverySettings> {
    const { data, error } = await supabase
      .from('delivery_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update delivery settings: ${error.message}`);
    }

    this.settings = data;
    return data;
  }

  async calculateDeliveryFee(
    restaurantLat: number,
    restaurantLng: number,
    deliveryLat: number,
    deliveryLng: number
  ): Promise<DeliveryCalculation> {
    const settings = await this.getDeliverySettings();
    
    if (!settings.is_delivery_enabled) {
      return {
        isWithinRange: false,
        distance: 0,
        deliveryFee: 0,
        estimatedTime: 0
      };
    }

    const distance = calculateDistance(restaurantLat, restaurantLng, deliveryLat, deliveryLng);
    const isWithinRange = distance <= settings.max_delivery_distance_km;

    if (!isWithinRange) {
      return {
        isWithinRange: false,
        distance,
        deliveryFee: 0,
        estimatedTime: 0
      };
    }

    // Calculate delivery fee: LKR 180 base + LKR 40 per additional km
    let deliveryFee = settings.base_fee; // Base fee for first 1km
    
    if (distance > 1) {
      const additionalKm = Math.ceil(distance - 1); // Round up additional distance
      deliveryFee += additionalKm * settings.per_km_fee;
    }

    // Estimate delivery time: 5 minutes per km + 10 minutes base
    const estimatedTime = Math.ceil(distance * 5) + 10;

    return {
      isWithinRange: true,
      distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      estimatedTime
    };
  }

  async getStandardDeliveryFee(): Promise<{ deliveryFee: number; estimatedTime: number }> {
    const settings = await this.getDeliverySettings();
    
    if (!settings.is_delivery_enabled) {
      return {
        deliveryFee: 0,
        estimatedTime: 0
      };
    }

    // Standard fee for medium distance (3km) when GPS not available
    const standardDistance = 3; // 3km average
    let deliveryFee = settings.base_fee; // Base fee for first 1km
    
    if (standardDistance > 1) {
      const additionalKm = Math.ceil(standardDistance - 1);
      deliveryFee += additionalKm * settings.per_km_fee;
    }

    // Standard estimated time for 3km
    const estimatedTime = Math.ceil(standardDistance * 5) + 10;

    return {
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      estimatedTime
    };
  }

  async createDeliveryTimeSlot(
    orderId: string,
    estimatedPrepTime: number = 30,
    estimatedDeliveryTime: number = 20
  ): Promise<DeliveryTimeSlot> {
    const { data, error } = await supabase
      .from('delivery_time_slots')
      .insert({
        order_id: orderId,
        estimated_prep_time: estimatedPrepTime,
        estimated_delivery_time: estimatedDeliveryTime,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create delivery time slot: ${error.message}`);
    }

    return data;
  }

  async updateDeliveryStatus(
    timeSlotId: string,
    status: DeliveryTimeSlot['status'],
    updatedBy: string,
    actualTime?: number
  ): Promise<DeliveryTimeSlot> {
    const updateData: any = {
      status,
      updated_by: updatedBy,
      updated_at: new Date().toISOString()
    };

    // Set actual times based on status
    if (status === 'ready' && actualTime) {
      updateData.actual_prep_time = actualTime;
    } else if (status === 'delivered' && actualTime) {
      updateData.actual_delivery_time = actualTime;
    }

    const { data, error } = await supabase
      .from('delivery_time_slots')
      .update(updateData)
      .eq('id', timeSlotId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update delivery status: ${error.message}`);
    }

    return data;
  }

  async getDeliveryTimeSlot(orderId: string): Promise<DeliveryTimeSlot | null> {
    const { data, error } = await supabase
      .from('delivery_time_slots')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No time slot found
      }
      throw new Error(`Failed to get delivery time slot: ${error.message}`);
    }

    return data;
  }

  async getActiveDeliveries(): Promise<DeliveryTimeSlot[]> {
    const { data, error } = await supabase
      .from('delivery_time_slots')
      .select(`
        *,
        orders!inner(
          id,
          order_number,
          delivery_address,
          customer_name,
          customer_phone,
          total_amount
        )
      `)
      .in('status', ['pending', 'preparing', 'ready', 'out_for_delivery'])
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get active deliveries: ${error.message}`);
    }

    return data || [];
  }

  // Clear cached settings when needed
  clearCache(): void {
    this.settings = null;
  }
}

export const deliveryService = DeliveryService.getInstance();
export default deliveryService;