import express from 'express';
import { authRoutes } from '../modules/auth/auth.route';

const router = express.Router();

// Import route modules
router.use('/auth', authRoutes);

export default router;
