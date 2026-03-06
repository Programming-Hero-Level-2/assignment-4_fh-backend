import express from 'express';
import { authRoute } from '../modules/auth/auth.route';
import { userRouter } from '../modules/user/user.route';
import { providerRoutes } from '../modules/provider/provider.route';
import { cuisineRouter } from '../modules/cuisine/cuisine.route';

const router = express.Router();

// Import route modules
router.use('/auth', authRoute);
router.use('/users', userRouter);
router.use('/cuisines', cuisineRouter);

// Provider routes
router.use('/restaurants', providerRoutes);

export default router;
