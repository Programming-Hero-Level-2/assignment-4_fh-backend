import express from 'express';
import { authRoute } from '../modules/auth/auth.route';
import { userRouter } from '../modules/user/user.route';

const router = express.Router();

// Import route modules
router.use('/auth', authRoute);
router.use('/users', userRouter);

export default router;
