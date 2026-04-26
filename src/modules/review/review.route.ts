import express from 'express';
import { authenticate, requireRole } from '../../middlewares/auth';
import { reviewController } from './review.controller';

const router = express.Router();

router.post(
  '/',
  authenticate,
  requireRole('CUSTOMER'),
  reviewController.createReview,
);
router.get(
  '/my',
  authenticate,
  requireRole('CUSTOMER'),
  reviewController.getMyReviews,
);

export const reviewRoutes = router;
