import { attachProviderId } from './../../middlewares/auth';
import express from 'express';
import { providerController } from './provider.controller';
import { authenticate } from '../../middlewares/auth';

const router = express.Router();

/* -- PROTECTED: Admin Routes -- */
router
  .get('/admin', providerController.findAllAdminProviders)
  .get('/admin/:id', providerController.getAdminProviderById);

/* -- PROTECTED: Provider Routes -- */
router
  .post('/provider', providerController.createProvideProfile)
  .get(
    '/provider',
    authenticate,
    attachProviderId,
    providerController.findProviderByUserId,
  )
  .patch('/provider/:userId', providerController.updateProviderProfile);

/* --- PUBLIC --- */
router
  .get('/', providerController.findAllPublicProviders)
  .get('/:id', providerController.getPublicProviderById);

export const providerRoutes = router;
