import express from 'express';
import {
  attachProviderId,
  authenticate,
  requireRole,
} from '../../middlewares/auth';
import { orderController } from './order.controller';

const router = express.Router();

/* ===== Customer ===== */
// Place an order
router.post(
  '/',
  authenticate,
  requireRole('CUSTOMER'),
  orderController.placeOrder,
);

// View my orders
router.get(
  '/my',
  authenticate,
  requireRole('CUSTOMER'),
  orderController.getMyOrders,
);

/* ===== Provider ===== */
// View orders for provider's restaurant (must be before /:id)
router.get(
  '/provider/orders',
  authenticate,
  requireRole('PROVIDER'),
  attachProviderId,
  orderController.getProviderOrders,
);

// Update order status
router.patch(
  '/:id/status',
  authenticate,
  requireRole('PROVIDER'),
  attachProviderId,
  orderController.updateOrderStatus,
);

/* ===== Admin ===== */
// View all orders (must be before /:id)
router.get(
  '/admin/all',
  authenticate,
  requireRole('ADMIN'),
  orderController.getAllOrders,
);

/* ===== Shared (Customer + Admin) ===== */
// View single order
router.get(
  '/:id',
  authenticate,
  requireRole('CUSTOMER', 'ADMIN'),
  orderController.getOrderById,
);

export const OrderRoutes = router;
