import { Prisma } from '../../../generated/prisma/client';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../constants';
import { prisma } from '../../lib/prisma';
import { PaginationMeta } from '../../shared/schemas/pagination.schema';
import { SORT_BY, SORT_TYPE } from '../../shared/schemas/sort.schema';
import { ApiError } from '../../utils/ApiError';
import { PROVIDER_STATUS_TRANSITIONS } from './order.constant';
import { CreateOrder, OrderQuery, UpdateOrderStatus } from './order.validation';

const orderInclude = {
  user: { select: { id: true, name: true, email: true } },
  provider: { select: { id: true, name: true, slug: true } },
  items: {
    include: {
      meal: { select: { id: true, name: true, slug: true, imageUrl: true } },
    },
  },
} satisfies Prisma.OrderInclude;

/* ===== Customer ===== */

const placeOrder = async (userId: string, data: CreateOrder) => {
  const {
    providerId,
    customerName,
    deliveryAddress,
    phone,
    note,
    paymentMethod,
    items,
  } = data;

  const provider = await prisma.providerProfile.findUnique({
    where: { id: providerId },
  });

  if (!provider) throw new ApiError(404, 'Restaurant not found');

  if (!provider.isOpen) {
    throw new ApiError(400, 'Restaurant is currently closed');
  }

  // Fetch all meals, validate they belong to this provider
  const mealIds = items.map((i) => i.mealId);
  const meals = await prisma.meal.findMany({
    where: { id: { in: mealIds }, providerId, status: 'AVAILABLE' },
  });

  if (meals.length !== mealIds.length) {
    throw new ApiError(
      400,
      'One or more meals are unavailable or do not belong to this restaurant',
    );
  }

  const mealMap = new Map(meals.map((m) => [m.id, m]));

  let totalAmount = new Prisma.Decimal(0);
  let totalItems = 0;

  const orderItems = items.map((item) => {
    const meal = mealMap.get(item.mealId)!;

    const effectivePrice =
      meal.discount && meal.discountType
        ? meal.discountType === 'PERCENTAGE'
          ? meal.price.mul(new Prisma.Decimal(1).sub(meal.discount.div(100)))
          : meal.price.sub(meal.discount)
        : meal.price;

    const lineTotal = effectivePrice.mul(item.quantity);
    totalAmount = totalAmount.add(lineTotal);
    totalItems += item.quantity;

    return {
      meal: { connect: { id: item.mealId } },
      quantity: item.quantity,
      price: effectivePrice,
    };
  });

  // Enforce minimum order amount
  if (totalAmount.lt(provider.minimumOrderAmount)) {
    throw new ApiError(
      400,
      `Minimum order amount is ${provider.minimumOrderAmount}`,
    );
  }

  const order = await prisma.order.create({
    data: {
      userId,
      providerId,
      customerName,
      deliveryAddress,
      phone,
      note,
      paymentMethod,
      totalAmount,
      totalItems,
      items: { create: orderItems },
    },
    include: orderInclude,
  });

  return order;
};

const getMyOrders = async (
  userId: string,
  query: OrderQuery,
): Promise<{ data: unknown[]; pagination: PaginationMeta }> => {
  const { status, paymentStatus } = query?.filter || {};
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = query?.pagination || {};
  const { sortBy = SORT_BY.CREATED_AT, sortType = SORT_TYPE.DESC } =
    query?.sort || {};

  const sanitizedPageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
  const skipAmount = (page - 1) * sanitizedPageSize;

  const where: Prisma.OrderWhereInput = {
    userId,
    ...(status && { status }),
    ...(paymentStatus && { paymentStatus }),
  };

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { [sortBy]: sortType },
      take: sanitizedPageSize,
      skip: skipAmount,
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / sanitizedPageSize);
  const currentPage = Math.floor(skipAmount / sanitizedPageSize) + 1;

  return {
    data,
    pagination: {
      totalItems: total,
      totalPages,
      currentPage,
      next: currentPage < totalPages ? currentPage + 1 : null,
      prev: currentPage > 1 ? currentPage - 1 : null,
    },
  };
};

const getOrderById = async (id: string, userId: string, role: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });

  if (!order) throw new ApiError(404, 'Order not found');

  // Customers can only see their own orders
  if (role === 'CUSTOMER' && order.userId !== userId) {
    throw new ApiError(403, 'Forbidden: this order does not belong to you');
  }

  return order;
};

/* ===== Provider ===== */

const getProviderOrders = async (
  providerId: string,
  query: OrderQuery,
): Promise<{ data: unknown[]; pagination: PaginationMeta }> => {
  const { status, paymentStatus } = query?.filter || {};
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = query?.pagination || {};
  const { sortBy = SORT_BY.CREATED_AT, sortType = SORT_TYPE.DESC } =
    query?.sort || {};

  const sanitizedPageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
  const skipAmount = (page - 1) * sanitizedPageSize;

  const where: Prisma.OrderWhereInput = {
    providerId,
    ...(status && { status }),
    ...(paymentStatus && { paymentStatus }),
  };

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { [sortBy]: sortType },
      take: sanitizedPageSize,
      skip: skipAmount,
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / sanitizedPageSize);
  const currentPage = Math.floor(skipAmount / sanitizedPageSize) + 1;

  return {
    data,
    pagination: {
      totalItems: total,
      totalPages,
      currentPage,
      next: currentPage < totalPages ? currentPage + 1 : null,
      prev: currentPage > 1 ? currentPage - 1 : null,
    },
  };
};

const updateOrderStatus = async (
  id: string,
  providerId: string,
  data: UpdateOrderStatus,
) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new ApiError(404, 'Order not found');

  if (order.providerId !== providerId) {
    throw new ApiError(
      403,
      'Forbidden: this order does not belong to your restaurant',
    );
  }

  const allowedNext = PROVIDER_STATUS_TRANSITIONS[order.status] ?? [];
  if (!allowedNext.includes(data.status)) {
    throw new ApiError(
      400,
      `Cannot transition from ${order.status} to ${data.status}. Allowed: ${allowedNext.join(', ') || 'none'}`,
    );
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: data.status },
    include: orderInclude,
  });

  return updated;
};

/* ===== Admin ===== */

const getAllOrders = async (
  query: OrderQuery,
): Promise<{ data: unknown[]; pagination: PaginationMeta }> => {
  const { status, paymentStatus } = query?.filter || {};
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = query?.pagination || {};
  const { sortBy = SORT_BY.CREATED_AT, sortType = SORT_TYPE.DESC } =
    query?.sort || {};

  const sanitizedPageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
  const skipAmount = (page - 1) * sanitizedPageSize;

  const where: Prisma.OrderWhereInput = {
    ...(status && { status }),
    ...(paymentStatus && { paymentStatus }),
  };

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { [sortBy]: sortType },
      take: sanitizedPageSize,
      skip: skipAmount,
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / sanitizedPageSize);
  const currentPage = Math.floor(skipAmount / sanitizedPageSize) + 1;

  return {
    data,
    pagination: {
      totalItems: total,
      totalPages,
      currentPage,
      next: currentPage < totalPages ? currentPage + 1 : null,
      prev: currentPage > 1 ? currentPage - 1 : null,
    },
  };
};

export const orderService = {
  placeOrder,
  getMyOrders,
  getOrderById,
  getProviderOrders,
  updateOrderStatus,
  getAllOrders,
};
