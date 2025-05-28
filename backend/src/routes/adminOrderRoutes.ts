import { Router } from 'express';
import * as adminOrderController from '../services/adminOrderService';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/admin/orders - Fetches all orders for admin
router.get(
  '/', // Path is relative to where this router is mounted (/api/admin/orders)
  authenticateToken, 
  requireAdmin, 
  adminOrderController.getAllOrdersHandler // Expecting this handler in adminOrderService
);

// PUT /api/admin/orders/:orderId/status - Updates order status
router.put(
  '/:orderId/status', // Path is relative to where this router is mounted
  authenticateToken, 
  requireAdmin, 
  adminOrderController.updateOrderStatusHandler // Expecting this handler in adminOrderService
);

export default router; 