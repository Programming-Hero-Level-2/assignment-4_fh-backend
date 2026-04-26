import { Prisma } from '../../../generated/prisma/client';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../constants';
import { prisma } from '../../lib/prisma';
import { PaginationMeta } from '../../shared/schemas/pagination.schema';
import { SORT_BY, SORT_TYPE } from '../../shared/schemas/sort.schema';
import { ApiError } from '../../utils/ApiError';
import { CreateReview, ReviewQuery } from './review.validation';

const reviewInclude = {
  order: {
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
  },
  user: { select: { id: true, name: true, email: true } },
  provider: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ReviewInclude;

const createReview = async (userId: string, data: CreateReview) => {
  const { orderId, rating, comment } = data;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { review: true },
  });

  if (!order) throw new ApiError(404, 'Order not found');

  if (order.userId !== userId) {
    throw new ApiError(403, 'Forbidden: this order does not belong to you');
  }

  if (order.status !== 'DELIVERED') {
    throw new ApiError(400, 'You can review only delivered orders');
  }

  if (order.review) {
    throw new ApiError(400, 'Review already submitted for this order');
  }

  const review = await prisma.review.create({
    data: {
      orderId,
      userId,
      providerId: order.providerId,
      rating,
      comment,
    },
    include: reviewInclude,
  });

  return review;
};

const getMyReviews = async (
  userId: string,
  query: ReviewQuery,
): Promise<{ data: unknown[]; pagination: PaginationMeta }> => {
  const { rating } = query?.filter || {};
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = query?.pagination || {};
  const { sortBy = SORT_BY.CREATED_AT, sortType = SORT_TYPE.DESC } =
    query?.sort || {};

  const sanitizedPageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
  const skipAmount = (page - 1) * sanitizedPageSize;

  const where: Prisma.ReviewWhereInput = {
    userId,
    ...(rating !== undefined && { rating }),
  };

  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: reviewInclude,
      orderBy: { [sortBy]: sortType },
      take: sanitizedPageSize,
      skip: skipAmount,
    }),
    prisma.review.count({ where }),
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

export const reviewService = {
  createReview,
  getMyReviews,
};
