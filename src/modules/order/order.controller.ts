import { IDSchema } from '../../shared/schemas/id.schema';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { generatePageLink } from '../../utils/generatePageLink';
import { orderService } from './order.service';
import {
  CreateOrderSchema,
  OrderQuerySchema,
  UpdateOrderStatusSchema,
} from './order.validation';

/* ===== Customer ===== */

const placeOrder = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');

  const data = CreateOrderSchema.parse(req.body);
  const order = await orderService.placeOrder(req.user.userId, data);

  res
    .status(201)
    .json(new ApiResponse(201, 'Order placed successfully', order));
});

const getMyOrders = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');

  const query = OrderQuerySchema.parse({
    filter: {
      status: req.query.status,
      paymentStatus: req.query.paymentStatus,
    },
    pagination: {
      page: req.query.page && Number(req.query.page),
      pageSize: req.query.pageSize && Number(req.query.pageSize),
    },
    sort: { sortBy: req.query.sortBy, sortType: req.query.sortType },
  });

  const { data, pagination } = await orderService.getMyOrders(
    req.user.userId,
    query,
  );

  res.status(200).json(
    new ApiResponse(200, 'Orders retrieved successfully', {
      orders: data,
      pagination,
      links: {
        self: req.originalUrl,
        next: generatePageLink(req.originalUrl, pagination.next),
        prev: generatePageLink(req.originalUrl, pagination.prev),
      },
    }),
  );
});

const getOrderById = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');

  const id = IDSchema.parse(req.params.id);
  const order = await orderService.getOrderById(
    id,
    req.user.userId,
    req.user.role,
  );

  res
    .status(200)
    .json(new ApiResponse(200, 'Order retrieved successfully', order));
});

/* ===== Provider ===== */

const getProviderOrders = asyncHandler(async (req, res) => {
  if (!req.providerId)
    throw new ApiError(403, 'Provider profile not found in session');

  const query = OrderQuerySchema.parse({
    filter: {
      status: req.query.status,
      paymentStatus: req.query.paymentStatus,
    },
    pagination: {
      page: req.query.page && Number(req.query.page),
      pageSize: req.query.pageSize && Number(req.query.pageSize),
    },
    sort: { sortBy: req.query.sortBy, sortType: req.query.sortType },
  });

  const { data, pagination } = await orderService.getProviderOrders(
    req.providerId,
    query,
  );

  res.status(200).json(
    new ApiResponse(200, 'Provider orders retrieved successfully', {
      orders: data,
      pagination,
      links: {
        self: req.originalUrl,
        next: generatePageLink(req.originalUrl, pagination.next),
        prev: generatePageLink(req.originalUrl, pagination.prev),
      },
    }),
  );
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  if (!req.providerId)
    throw new ApiError(403, 'Provider profile not found in session');

  const id = IDSchema.parse(req.params.id);
  const data = UpdateOrderStatusSchema.parse(req.body);

  const updated = await orderService.updateOrderStatus(
    id,
    req.providerId,
    data,
  );

  res
    .status(200)
    .json(new ApiResponse(200, 'Order status updated successfully', updated));
});

/* ===== Admin ===== */

const getAllOrders = asyncHandler(async (req, res) => {
  const query = OrderQuerySchema.parse({
    filter: {
      status: req.query.status,
      paymentStatus: req.query.paymentStatus,
    },
    pagination: {
      page: req.query.page && Number(req.query.page),
      pageSize: req.query.pageSize && Number(req.query.pageSize),
    },
    sort: { sortBy: req.query.sortBy, sortType: req.query.sortType },
  });

  const { data, pagination } = await orderService.getAllOrders(query);

  res.status(200).json(
    new ApiResponse(200, 'All orders retrieved successfully', {
      orders: data,
      pagination,
      links: {
        self: req.originalUrl,
        next: generatePageLink(req.originalUrl, pagination.next),
        prev: generatePageLink(req.originalUrl, pagination.prev),
      },
    }),
  );
});

export const orderController = {
  placeOrder,
  getMyOrders,
  getOrderById,
  getProviderOrders,
  updateOrderStatus,
  getAllOrders,
};
