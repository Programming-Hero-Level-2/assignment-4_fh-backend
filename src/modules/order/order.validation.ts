import { z } from 'zod';
import { PaginationQuerySchema } from '../../shared/schemas/pagination.schema';
import { SortQuerySchema } from '../../shared/schemas/sort.schema';

export const OrderStatus = {
  PLACED: 'PLACED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export const PaymentMethod = {
  COD: 'COD',
} as const;

export const PaymentStatus = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
} as const;

export const PROVIDER_ALLOWED_STATUSES = [
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
] as const;

/* ---------- OrderItem ---------- */
export const OrderItemSchema = z.object({
  mealId: z.uuid(),
  quantity: z.number().int().positive(),
});

/* ---------- Create Order ---------- */
export const CreateOrderSchema = z.object({
  providerId: z.uuid(),
  deliveryAddress: z.string().min(5),
  phone: z.string().min(7),
  paymentMethod: z.enum(PaymentMethod).default(PaymentMethod.COD),
  items: z.array(OrderItemSchema).min(1),
});

/* ---------- Update Order Status (Provider) ---------- */
export const UpdateOrderStatusSchema = z.object({
  status: z.enum(PROVIDER_ALLOWED_STATUSES),
});

/* ---------- Order Query ---------- */
export const OrderQuerySchema = z
  .object({
    filter: z
      .object({
        status: z.enum(OrderStatus),
        paymentStatus: z.enum(PaymentStatus),
      })
      .partial()
      .optional(),
    pagination: PaginationQuerySchema.optional(),
    sort: SortQuerySchema.optional(),
  })
  .partial();

// Types
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatus = z.infer<typeof UpdateOrderStatusSchema>;
export type OrderQuery = z.infer<typeof OrderQuerySchema>;
