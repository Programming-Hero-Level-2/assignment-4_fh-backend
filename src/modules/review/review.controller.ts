import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { generatePageLink } from '../../utils/generatePageLink';
import { CreateReviewSchema, ReviewQuerySchema } from './review.validation';
import { reviewService } from './review.service';

const createReview = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');

  const data = CreateReviewSchema.parse(req.body);
  const review = await reviewService.createReview(req.user.userId, data);

  res
    .status(201)
    .json(new ApiResponse(201, 'Review submitted successfully', review));
});

const getMyReviews = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');

  const query = ReviewQuerySchema.parse({
    filter: {
      rating: req.query.rating && Number(req.query.rating),
    },
    pagination: {
      page: req.query.page && Number(req.query.page),
      pageSize: req.query.pageSize && Number(req.query.pageSize),
    },
    sort: {
      sortBy: req.query.sortBy,
      sortType: req.query.sortType,
    },
  });

  const { data, pagination } = await reviewService.getMyReviews(
    req.user.userId,
    query,
  );

  res.status(200).json(
    new ApiResponse(200, 'My reviews retrieved successfully', {
      reviews: data,
      pagination,
      links: {
        self: req.originalUrl,
        next: generatePageLink(req.originalUrl, pagination.next),
        prev: generatePageLink(req.originalUrl, pagination.prev),
      },
    }),
  );
});

export const reviewController = {
  createReview,
  getMyReviews,
};
