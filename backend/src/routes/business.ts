import { Router } from 'express';
import { config } from '../config';
import { ApiResponse, BusinessHours, isRestaurantOpen } from '@realtaste/shared';

const router = Router();

// GET /api/business/hours - Get business hours and current status
router.get('/hours', async (req, res) => {
  try {
    const businessHours: BusinessHours = {
      open_time: config.business.openTime,
      close_time: config.business.closeTime,
      timezone: config.business.timezone,
      is_open: true // This could be dynamic based on holidays, etc.
    };

    const currentlyOpen = isRestaurantOpen(businessHours);

    const response: ApiResponse<{
      business_hours: BusinessHours;
      currently_open: boolean;
      restaurant_name: string;
      restaurant_phone: string;
    }> = {
      success: true,
      data: {
        business_hours: businessHours,
        currently_open: currentlyOpen,
        restaurant_name: config.business.name,
        restaurant_phone: config.business.phone
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching business hours:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch business hours'
    });
  }
});

// GET /api/business/status - Get current restaurant status
router.get('/status', async (req, res) => {
  try {
    const businessHours: BusinessHours = {
      open_time: config.business.openTime,
      close_time: config.business.closeTime,
      timezone: config.business.timezone,
      is_open: true
    };

    const currentlyOpen = isRestaurantOpen(businessHours);
    
    // Get current Sri Lanka time
    const now = new Date();
    const sriLankaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Colombo" }));
    
    const response: ApiResponse<{
      is_open: boolean;
      current_time: string;
      next_opening?: string;
      message: string;
    }> = {
      success: true,
      data: {
        is_open: currentlyOpen,
        current_time: sriLankaTime.toISOString(),
        message: currentlyOpen 
          ? `We're open! Orders accepted until ${config.business.closeTime}`
          : `We're closed. We open at ${config.business.openTime} tomorrow.`
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching business status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch business status'
    });
  }
});

export default router;
