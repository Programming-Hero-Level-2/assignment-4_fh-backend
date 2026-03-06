import express from 'express';
import { cuisineController } from './cuisine.controller';

const router = express.Router();

router
  .get('/', cuisineController.getAllCuisines)
  .post('/', cuisineController.createCuisine)
  .get('/:id', cuisineController.getCuisine)
  .patch('/:id/status', cuisineController.updateCuisineStatus)
  .patch('/:id', cuisineController.updateCuisine)
  .delete('/:id', cuisineController.deleteCuisine);

export { router as cuisineRouter };
