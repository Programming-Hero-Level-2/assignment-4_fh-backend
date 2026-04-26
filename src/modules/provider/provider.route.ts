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
  .post('/provider', authenticate, providerController.createProvideProfile)
  .get(
    '/provider',
    authenticate,
    attachProviderId,
    providerController.findProviderByUserId,
  )
  // .get(
  //   '/provider/user/:userId',
  //   authenticate,
  //   attachProviderId,
  //   providerController.findProviderByUserId,
  // )
  .patch('/provider/:id', providerController.updateProviderProfile);

/* --- PUBLIC --- */
router
  .get('/featured', providerController.findAllFeaturedPublicProviders)
  .get('/:id', providerController.getPublicProviderById)
  .get('/', providerController.findAllPublicProviders);

export const providerRoutes = router;
