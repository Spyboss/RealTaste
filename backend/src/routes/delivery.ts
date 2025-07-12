import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { adminLimiter } from '../middleware/rateLimiter';
import { ApiResponse } from '../types/shared';
import { deliveryService, DeliverySettings, DeliveryTimeSlot } from '../services/deliveryService';

const router = Router();

// GET /api/delivery/settings - Get delivery settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await deliveryService.getDeliverySettings();
    
    const response: ApiResponse<DeliverySettings> = {
      success: true,
      data: settings
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching delivery settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch delivery settings'
    });
  }
});

// PUT /api/delivery/settings - Update delivery settings (admin only)
router.put('/settings', 
  authenticateToken,
  requireAdmin,
  adminLimiter,
  async (req, res) => {
    try {
      const { base_fee, per_km_fee, max_delivery_range_km, min_order_for_delivery, is_delivery_enabled } = req.body;
      
      // Validate input
      if (base_fee !== undefined && (typeof base_fee !== 'number' || base_fee < 0)) {
        return res.status(400).json({
          success: false,
          error: 'Base fee must be a non-negative number'
        });
      }
      
      if (per_km_fee !== undefined && (typeof per_km_fee !== 'number' || per_km_fee < 0)) {
        return res.status(400).json({
          success: false,
          error: 'Per km fee must be a non-negative number'
        });
      }
      
      if (max_delivery_range_km !== undefined && (typeof max_delivery_range_km !== 'number' || max_delivery_range_km <= 0)) {
        return res.status(400).json({
          success: false,
          error: 'Maximum delivery range must be a positive number'
        });
      }
      
      const updatedSettings = await deliveryService.updateDeliverySettings({
        base_fee,
        per_km_fee,
        max_delivery_range_km,
        min_order_for_delivery,
        is_delivery_enabled
      });
      
      const response: ApiResponse<DeliverySettings> = {
        success: true,
        data: updatedSettings,
        message: 'Delivery settings updated successfully'
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error updating delivery settings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update delivery settings'
      });
    }
  }
);

// POST /api/delivery/calculate-fee - Calculate delivery fee for given coordinates
router.post('/calculate-fee', async (req, res) => {
  try {
    const { delivery_latitude, delivery_longitude } = req.body;
    
    if (!delivery_latitude || !delivery_longitude) {
      return res.status(400).json({
        success: false,
        error: 'Delivery coordinates are required'
      });
    }
    
    const restaurantLat = parseFloat(process.env.VITE_RESTAURANT_LAT || '6.261449');
    const restaurantLng = parseFloat(process.env.VITE_RESTAURANT_LNG || '80.906462');
    
    const calculation = await deliveryService.calculateDeliveryFee(
      restaurantLat,
      restaurantLng,
      delivery_latitude,
      delivery_longitude
    );
    
    const response: ApiResponse<typeof calculation> = {
      success: true,
      data: calculation
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error calculating delivery fee:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate delivery fee'
    });
  }
});

// GET /api/delivery/standard-fee - Get standard delivery fee when coordinates not available
router.get('/standard-fee', async (req, res) => {
  try {
    const standardFee = await deliveryService.getStandardDeliveryFee();
    
    const response: ApiResponse<{ deliveryFee: number; estimatedTime: number }> = {
      success: true,
      data: standardFee
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error getting standard delivery fee:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get standard delivery fee'
    });
  }
});

// GET /api/delivery/active - Get active deliveries (admin only)
router.get('/active',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const activeDeliveries = await deliveryService.getActiveDeliveries();
      
      const response: ApiResponse<DeliveryTimeSlot[]> = {
        success: true,
        data: activeDeliveries
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching active deliveries:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch active deliveries'
      });
    }
  }
);

// PATCH /api/delivery/status/:timeSlotId - Update delivery status (admin only)
router.patch('/status/:timeSlotId',
  authenticateToken,
  requireAdmin,
  adminLimiter,
  async (req, res) => {
    try {
      const { timeSlotId } = req.params;
      const { status, actual_time } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required'
        });
      }
      
      const validStatuses = ['pending', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      
      const updatedTimeSlot = await deliveryService.updateDeliveryStatus(
        timeSlotId,
        status,
        req.user!.id,
        actual_time
      );
      
      const response: ApiResponse<DeliveryTimeSlot> = {
        success: true,
        data: updatedTimeSlot,
        message: 'Delivery status updated successfully'
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update delivery status'
      });
    }
  }
);

// GET /api/delivery/time-slot/:orderId - Get delivery time slot for order
router.get('/time-slot/:orderId',
  authenticateToken,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      
      const timeSlot = await deliveryService.getDeliveryTimeSlot(orderId);
      
      if (!timeSlot) {
        return res.status(404).json({
          success: false,
          error: 'Delivery time slot not found'
        });
      }
      
      const response: ApiResponse<DeliveryTimeSlot> = {
        success: true,
        data: timeSlot
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching delivery time slot:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch delivery time slot'
      });
    }
  }
);

export default router;