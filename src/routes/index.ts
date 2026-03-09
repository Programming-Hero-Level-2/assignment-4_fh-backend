import express from 'express';
import { authRoute } from '../modules/auth/auth.route';
import { userRouter } from '../modules/user/user.route';
import { providerRoutes } from '../modules/provider/provider.route';
import { cuisineRouter } from '../modules/cuisine/cuisine.route';
import { mealRouter } from '../modules/meal/meal.route';

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', userRouter);
router.use('/cuisines', cuisineRouter);
router.use('/restaurants', providerRoutes);
router.use('/', mealRouter);

export default router;
