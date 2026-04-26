import { IDSchema } from '../../shared/schemas/id.schema';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { generatePageLink } from '../../utils/generatePageLink';
import { mealService } from './meal.service';
import {
  CreateMealCategorySchema,
  UpdateMealCategorySchema,
  UpdateMealCategoryStatusSchema,
  CreateMealSchema,
  UpdateMealSchema,
  UpdateMealStatusSchema,
  MealQuerySchema,
  MealCategoryQuerySchema,
} from './meal.validation';

export const getProviderId = (
  req: Parameters<typeof asyncHandler>[0] extends (
    req: infer R,
    ...args: any[]
  ) => any
    ? R
    : never,
): string => {
  if (!req.providerId)
    throw new ApiError(403, 'Provider profile not found in session');
  return req.providerId;
};

/* ---- Provider: Meal Categories ---- */

const getAllMealCategories = asyncHandler(async (req, res) => {
  const providerId = getProviderId(req);

  const query = MealCategoryQuerySchema.parse({
    filter: { name: req.query.name, status: req.query.status },
    pagination: {
      page: req.query.page && Number(req.query.page),
      pageSize: req.query.pageSize && Number(req.query.pageSize),
    },
    sort: { sortBy: req.query.sortBy, sortType: req.query.sortType },
  });

  const { data, pagination } = await mealService.findAllMealCategories(
    providerId,
    query,
  );

  res.status(200).json(
    new ApiResponse(200, 'Meal categories retrieved successfully', {
      mealCategories: data,
      pagination,
      links: {
        self: req.originalUrl,
        next: generatePageLink(req.originalUrl, pagination.next),
        prev: generatePageLink(req.originalUrl, pagination.prev),
      },
    }),
  );
});

const getMealCategory = asyncHandler(async (req, res) => {
  const id = IDSchema.parse(req.params.id);
  const category = await mealService.findMealCategoryById(id);

  res
    .status(200)
    .json(
      new ApiResponse(200, 'Meal category retrieved successfully', category),
    );
});

const createMealCategory = asyncHandler(async (req, res) => {
  const providerId = getProviderId(req);

  const data = CreateMealCategorySchema.parse(req.body);

  const category = await mealService.createMealCategory(providerId, data);

  res
    .status(201)
    .json(new ApiResponse(201, 'Meal category created successfully', category));
});

const updateMealCategory = asyncHandler(async (req, res) => {
  const id = IDSchema.parse(req.params.id);
  const providerId = getProviderId(req);

  const data = UpdateMealCategorySchema.parse(req.body);
  const category = await mealService.updateMealCategory(id, providerId, data);

  res
    .status(200)
    .json(new ApiResponse(200, 'Meal category updated successfully', category));
});

const updateMealCategoryStatus = asyncHandler(async (req, res) => {
  const id = IDSchema.parse(req.params.id);
  const providerId = getProviderId(req);

  const data = UpdateMealCategoryStatusSchema.parse(req.body);
  const category = await mealService.updateMealCategoryStatus(
    id,
    providerId,
    data,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        'Meal category status updated successfully',
        category,
      ),
    );
});

const deleteMealCategory = asyncHandler(async (req, res) => {
  const id = IDSchema.parse(req.params.id);
  const providerId = getProviderId(req);

  await mealService.deleteMealCategory(id, providerId);

  res
    .status(200)
    .json(new ApiResponse(200, 'Meal category deleted successfully', null));
});

/* ---- Provider: Meals ---- */

const getProviderMeals = asyncHandler(async (req, res) => {
  const providerId = getProviderId(req);
  const query = MealQuerySchema.parse({
    filter: {
      name: req.query.name,
      status: req.query.status,
      isVegan:
        req.query.isVegan !== undefined
          ? req.query.isVegan === 'true'
          : undefined,
      isBestSeller:
        req.query.isBestSeller !== undefined
          ? req.query.isBestSeller === 'true'
          : undefined,
    },
    pagination: {
      page: req.query.page && Number(req.query.page),
      pageSize: req.query.pageSize && Number(req.query.pageSize),
    },
    sort: { sortBy: req.query.sortBy, sortType: req.query.sortType },
  });

  const { data, pagination } = await mealService.findMealsByProvider(
    providerId,
    query,
  );

  res.status(200).json(
    new ApiResponse(200, 'Meals retrieved successfully', {
      meals: data,
      pagination,
      links: {
        self: req.originalUrl,
        next: generatePageLink(req.originalUrl, pagination.next),
        prev: generatePageLink(req.originalUrl, pagination.prev),
      },
    }),
  );
});

const getMeal = asyncHandler(async (req, res) => {
  const id = IDSchema.parse(req.params.id);

  const meal = await mealService.findMealById(id);

  res
    .status(200)
    .json(new ApiResponse(200, 'Meal retrieved successfully', meal));
});

const createMeal = asyncHandler(async (req, res) => {
  const providerId = getProviderId(req);

  const data = CreateMealSchema.parse(req.body);

  const meal = await mealService.createMeal(providerId, data);

  res.status(201).json(new ApiResponse(201, 'Meal created successfully', meal));
});

const updateMeal = asyncHandler(async (req, res) => {
  const id = IDSchema.parse(req.params.id);
  const providerId = getProviderId(req);

  const data = UpdateMealSchema.parse(req.body);

  const meal = await mealService.updateMeal(id, providerId, data);

  res.status(200).json(new ApiResponse(200, 'Meal updated successfully', meal));
});

const updateMealStatus = asyncHandler(async (req, res) => {
  const id = IDSchema.parse(req.params.id);
  const providerId = getProviderId(req);
  console.log('REQ BODY: >>', req.body);
  const data = UpdateMealStatusSchema.parse(req.body);
  const meal = await mealService.updateMealStatus(id, providerId, data);

  res
    .status(200)
    .json(new ApiResponse(200, 'Meal status updated successfully', meal));
});

const deleteMeal = asyncHandler(async (req, res) => {
  const id = IDSchema.parse(req.params.id);
  const providerId = getProviderId(req);

  await mealService.deleteMeal(id, providerId);

  res.status(200).json(new ApiResponse(200, 'Meal deleted successfully', null));
});

/* ---- Public: Meals ---- */

const getPublicMealsByProvider = asyncHandler(async (req, res) => {
  const providerId = IDSchema.parse(req.params.providerId);
  const query = MealQuerySchema.parse({
    filter: {
      name: req.query.name,
      isVegan:
        req.query.isVegan !== undefined
          ? req.query.isVegan === 'true'
          : undefined,
      isBestSeller:
        req.query.isBestSeller !== undefined
          ? req.query.isBestSeller === 'true'
          : undefined,
      mealCategoryId: req.query.mealCategoryId,
    },
    pagination: {
      page: req.query.page && Number(req.query.page),
      pageSize: req.query.pageSize && Number(req.query.pageSize),
    },
    sort: { sortBy: req.query.sortBy, sortType: req.query.sortType },
  });

  const { data, pagination } = await mealService.findPublicMealsByProvider(
    providerId,
    query,
  );

  res.status(200).json(
    new ApiResponse(200, 'Meals retrieved successfully', {
      meals: data,
      pagination,
      links: {
        self: req.originalUrl,
        next: generatePageLink(req.originalUrl, pagination.next),
        prev: generatePageLink(req.originalUrl, pagination.prev),
      },
    }),
  );
});

/* ---- Admin: Read-only ---- */

const getAllMealCategoriesAdmin = asyncHandler(async (req, res) => {
  const query = MealCategoryQuerySchema.parse({
    filter: { name: req.query.name, status: req.query.status },
    pagination: {
      page: req.query.page && Number(req.query.page),
      pageSize: req.query.pageSize && Number(req.query.pageSize),
    },
    sort: { sortBy: req.query.sortBy, sortType: req.query.sortType },
  });

  const { data, pagination } =
    await mealService.findAllMealCategoriesForAdmin(query);

  res.status(200).json(
    new ApiResponse(200, 'Meal categories retrieved successfully', {
      mealCategories: data,
      pagination,
      links: {
        self: req.originalUrl,
        next: generatePageLink(req.originalUrl, pagination.next),
        prev: generatePageLink(req.originalUrl, pagination.prev),
      },
    }),
  );
});

const getAllMealsAdmin = asyncHandler(async (req, res) => {
  const query = MealQuerySchema.parse({
    filter: {
      name: req.query.name,
      status: req.query.status,
      isVegan:
        req.query.isVegan !== undefined
          ? req.query.isVegan === 'true'
          : undefined,
      isBestSeller:
        req.query.isBestSeller !== undefined
          ? req.query.isBestSeller === 'true'
          : undefined,
      mealCategoryId: req.query.mealCategoryId,
    },
    pagination: {
      page: req.query.page && Number(req.query.page),
      pageSize: req.query.pageSize && Number(req.query.pageSize),
    },
    sort: { sortBy: req.query.sortBy, sortType: req.query.sortType },
  });

  const { data, pagination } = await mealService.findAllMealsForAdmin(query);

  res.status(200).json(
    new ApiResponse(200, 'Meals retrieved successfully', {
      meals: data,
      pagination,
      links: {
        self: req.originalUrl,
        next: generatePageLink(req.originalUrl, pagination.next),
        prev: generatePageLink(req.originalUrl, pagination.prev),
      },
    }),
  );
});

export const mealController = {
  /* meal categories */
  getAllMealCategories,
  getMealCategory,
  createMealCategory,
  updateMealCategory,
  updateMealCategoryStatus,
  deleteMealCategory,
  /* provider meals */
  getProviderMeals,
  getMeal,
  createMeal,
  updateMeal,
  updateMealStatus,
  deleteMeal,
  /* public */
  getPublicMealsByProvider,
  /* admin (read-only) */
  getAllMealCategoriesAdmin,
  getAllMealsAdmin,
  getMealAdmin: getMeal,
  getMealCategoryAdmin: getMealCategory,
};
