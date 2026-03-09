import express from 'express';
import { mealController } from './meal.controller';
import {
  attachProviderId,
  authenticate,
  requireRole,
} from '../../middlewares/auth';

const router = express.Router();

/* ---- Public ---- */
router.get(
  '/restaurants/:providerId/meals',
  mealController.getPublicMealsByProvider,
);

/* ---- Provider: Meal Categories ---- */
router
  .get(
    '/meal-categories',
    authenticate,
    requireRole('PROVIDER'),
    attachProviderId,
    mealController.getAllMealCategories,
  )
  .post(
    '/meal-categories',
    authenticate,
    requireRole('PROVIDER'),
    attachProviderId,
    mealController.createMealCategory,
  )
  .get(
    '/meal-categories/:id',
    authenticate,
    requireRole('PROVIDER'),
    attachProviderId,
    mealController.getMealCategory,
  )
  .patch(
    '/meal-categories/:id/status',
    authenticate,
    requireRole('PROVIDER'),
    attachProviderId,
    mealController.updateMealCategoryStatus,
  )
  .patch(
    '/meal-categories/:id',
    authenticate,
    requireRole('PROVIDER'),
    attachProviderId,
    mealController.updateMealCategory,
  )
  .delete(
    '/meal-categories/:id',
    authenticate,
    requireRole('PROVIDER'),
    attachProviderId,
    mealController.deleteMealCategory,
  );

/* ---- Provider: Meals ---- */
router
  .get(
    '/provider/meals',
    authenticate,
    requireRole('PROVIDER'),
    attachProviderId,
    mealController.getProviderMeals,
  )
  .post(
    '/provider/meals',
    authenticate,
    requireRole('PROVIDER'),
    attachProviderId,
    mealController.createMeal,
  )
  .get(
    '/provider/meals/:id',
    authenticate,
    requireRole('PROVIDER'),
    attachProviderId,
    mealController.getMeal,
  )
  .patch(
    '/provider/meals/:id/status',
    authenticate,
    requireRole('PROVIDER'),
    attachProviderId,
    mealController.updateMealStatus,
  )
  .patch(
    '/provider/meals/:id',
    authenticate,
    requireRole('PROVIDER'),
    attachProviderId,
    mealController.updateMeal,
  )
  .delete(
    '/provider/meals/:id',
    authenticate,
    requireRole('PROVIDER'),
    attachProviderId,
    mealController.deleteMeal,
  );

/* ---- Admin: Read-only ---- */
router
  .get(
    '/admin/meal-categories',
    authenticate,
    requireRole('ADMIN'),
    mealController.getAllMealCategoriesAdmin,
  )
  .get(
    '/admin/meal-categories/:id',
    authenticate,
    requireRole('ADMIN'),
    mealController.getMealCategoryAdmin,
  )
  .get(
    '/admin/meals',
    authenticate,
    requireRole('ADMIN'),
    mealController.getAllMealsAdmin,
  )
  .get(
    '/admin/meals/:id',
    authenticate,
    requireRole('ADMIN'),
    mealController.getMealAdmin,
  );

export { router as mealRouter };
