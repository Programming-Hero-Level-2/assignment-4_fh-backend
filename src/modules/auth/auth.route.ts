import express from 'express';
import { authController } from './auth.controller';

const router = express.Router();

router
  .post('/login', authController.login)
  .post('/register', authController.customerRegister)
  .post('/provider-signup', authController.providerSignup);

export const authRoutes = router;
