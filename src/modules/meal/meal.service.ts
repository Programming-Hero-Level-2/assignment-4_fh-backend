import { Prisma } from '../../../generated/prisma/client';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../constants';
import { prisma } from '../../lib/prisma';
import { PaginationMeta } from '../../shared/schemas/pagination.schema';
import { SORT_BY, SORT_TYPE } from '../../shared/schemas/sort.schema';
import { ApiError } from '../../utils/ApiError';
import { generateSlug } from '../../utils/slug';
import {
  CategoryStatus,
  CreateMeal,
  CreateMealCategory,
  Meal,
  MealCategory,
  MealCategoryQuery,
  MealQuery,
  MealStatus,
  UpdateMeal,
  UpdateMealCategory,
  UpdateMealCategoryStatus,
  UpdateMealStatus,
} from './meal.validation';

/* ============ MEAL CATEGORY ============ */

const findAllMealCategories = async (
  providerId: string,
  query: MealCategoryQuery,
): Promise<{ data: MealCategory[]; pagination: PaginationMeta }> => {
  const { name, status } = query?.filter || {};
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = query?.pagination || {};
  const { sortBy = SORT_BY.CREATED_AT, sortType = SORT_TYPE.DESC } =
    query?.sort || {};

  const sanitizedPageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
  const skipAmount = (page - 1) * sanitizedPageSize;

  const where: Prisma.MealCategoryWhereInput = {
    providerId,
    ...(name && { name: { contains: name, mode: 'insensitive' } }),
    ...(status && { status }),
  };

  const [data, total] = await Promise.all([
    prisma.mealCategory.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { [sortBy]: sortType },
      take: sanitizedPageSize,
      skip: skipAmount,
      omit: {
        providerId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.mealCategory.count({ where }),
  ]);

  const totalPages = Math.ceil(total / sanitizedPageSize);
  const currentPage = Math.floor(skipAmount / sanitizedPageSize) + 1;

  return {
    data: data as unknown as MealCategory[],
    pagination: {
      totalItems: total,
      totalPages,
      currentPage,
      next: currentPage < totalPages ? currentPage + 1 : null,
      prev: currentPage > 1 ? currentPage - 1 : null,
    },
  };
};

const findMealCategoryById = async (
  id: string,
): Promise<Omit<
  MealCategory,
  'providerId' | 'createdAt' | 'updatedAt'
> | null> => {
  const category = await prisma.mealCategory.findUnique({
    where: { id },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    omit: {
      providerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!category) throw new ApiError(404, 'Meal category not found');

  return category ? category : null;
};

const createMealCategory = async (
  providerId: string,
  data: CreateMealCategory,
): Promise<MealCategory> => {
  const slug = data.slug ?? `${generateSlug(data.name)}-${providerId.slice(0, 5)}`;
  const existing = await prisma.mealCategory.findFirst({
    where: { AND: [{ name: data.name }, { providerId }, { slug }] },
  });

  if (existing)
    throw new ApiError(
      409,
      'Meal category with this name or slug already exists',
    );

  const category = await prisma.mealCategory.create({
    data: {
      name: data.name,
      description: data.description,
      slug,
      imageUrl: data.imageUrl,
      status: data.status ?? CategoryStatus.ACTIVE,
      providerId,
    },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    omit: {
      providerId: true,
    },
  });
  return category as unknown as MealCategory;
};

const updateMealCategory = async (
  id: string,
  providerId: string,
  data: UpdateMealCategory,
): Promise<MealCategory> => {
  const category = await prisma.mealCategory.findFirst({
    where: { id, providerId },
  });

  if (!category)
    throw new ApiError(404, 'Meal category not found or access denied');

  const slug = data.name && !data.slug ? generateSlug(data.name) : data.slug;

  const updated = await prisma.mealCategory.update({
    where: { id },
    data: { ...data, ...(slug && { slug }) },
  });

  return updated as unknown as MealCategory;
};

const updateMealCategoryStatus = async (
  id: string,
  providerId: string,
  data: UpdateMealCategoryStatus,
): Promise<MealCategory> => {
  const category = await prisma.mealCategory.findFirst({
    where: { id, providerId },
  });

  if (!category)
    throw new ApiError(404, 'Meal category not found or access denied');

  const updated = await prisma.mealCategory.update({
    where: { id },
    data: { status: data.status },

    omit: {
      description: true,
      slug: true,
      imageUrl: true,
      providerId: true,
      createdAt: true,
    },
  });

  return updated as unknown as MealCategory;
};

const deleteMealCategory = async (
  id: string,
  providerId: string,
): Promise<void> => {
  const category = await prisma.mealCategory.findFirst({
    where: { id, providerId },
  });

  if (!category)
    throw new ApiError(404, 'Meal category not found or access denied');

  await prisma.mealCategory.delete({ where: { id } });
};

/* ============ MEAL ============ */

const findMealsByProvider = async (
  providerId: string,
  query: MealQuery,
): Promise<{ data: Meal[]; pagination: PaginationMeta }> => {
  const { name, status, isVegan, isBestSeller } = query?.filter || {};
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = query?.pagination || {};
  const { sortBy = SORT_BY.CREATED_AT, sortType = SORT_TYPE.DESC } =
    query?.sort || {};

  const sanitizedPageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
  const skipAmount = (page - 1) * sanitizedPageSize;

  const where: Prisma.MealWhereInput = {
    providerId,
    ...(name && { name: { contains: name, mode: 'insensitive' } }),
    ...(status && { status }),
    ...(isVegan !== undefined && { isVegan }),
    ...(isBestSeller !== undefined && { isBestSeller }),
  };

  const [data, total] = await Promise.all([
    prisma.meal.findMany({
      where,
      include: {
        mealCategory: {
          select: {
            id: true,
            name: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { [sortBy]: sortType },
      take: sanitizedPageSize,
      skip: skipAmount,
      omit: {
        providerId: true,
        mealCategoryId: true,
      },
    }),

    prisma.meal.count({ where }),
  ]);

  const totalPages = Math.ceil(total / sanitizedPageSize);
  const currentPage = Math.floor(skipAmount / sanitizedPageSize) + 1;

  return {
    data: data as unknown as Meal[],
    pagination: {
      totalItems: total,
      totalPages,
      currentPage,
      next: currentPage < totalPages ? currentPage + 1 : null,
      prev: currentPage > 1 ? currentPage - 1 : null,
    },
  };
};

const findPublicMealsByProvider = async (
  providerId: string,
  query: MealQuery,
): Promise<{ data: Meal[]; pagination: PaginationMeta }> => {
  const { name, isVegan, isBestSeller } = query?.filter || {};
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = query?.pagination || {};
  const { sortBy = SORT_BY.CREATED_AT, sortType = SORT_TYPE.DESC } =
    query?.sort || {};

  const sanitizedPageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
  const skipAmount = (page - 1) * sanitizedPageSize;

  const where: Prisma.MealWhereInput = {
    providerId,
    status: MealStatus.AVAILABLE,
    ...(name && { name: { contains: name, mode: 'insensitive' } }),
    ...(isVegan !== undefined && { isVegan }),
    ...(isBestSeller !== undefined && { isBestSeller }),
  };

  const [data, total] = await Promise.all([
    prisma.meal.findMany({
      where,
      include: {
        mealCategory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { [sortBy]: sortType },
      take: sanitizedPageSize,
      skip: skipAmount,
      omit: {
        status: true,
        mealCategoryId: true,
        createdAt: true,
        updatedAt: true,
        providerId: true,
      },
    }),

    prisma.meal.count({ where }),
  ]);

  const totalPages = Math.ceil(total / sanitizedPageSize);
  const currentPage = Math.floor(skipAmount / sanitizedPageSize) + 1;

  return {
    data: data as unknown as Meal[],
    pagination: {
      totalItems: total,
      totalPages,
      currentPage,
      next: currentPage < totalPages ? currentPage + 1 : null,
      prev: currentPage > 1 ? currentPage - 1 : null,
    },
  };
};

const findMealById = async (id: string): Promise<Meal | null> => {
  const meal = await prisma.meal.findUnique({
    where: { id },
    include: {
      mealCategory: {
        select: {
          id: true,
          name: true,
        },
      },
      provider: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    omit: {
      mealCategoryId: true,
      providerId: true,
    },
  });

  if (!meal) throw new ApiError(404, 'Meal not found');

  return meal ? (meal as unknown as Meal) : null;
};

const createMeal = async (
  providerId: string,
  data: CreateMeal,
): Promise<Meal> => {
  const slug = data.slug ?? generateSlug(data.name);

  const existing = await prisma.meal.findFirst({ where: { OR: [{ slug }] } });
  if (existing) throw new ApiError(409, 'Meal with this slug already exists');

  if (data.mealCategoryId) {
    const category = await prisma.mealCategory.findFirst({
      where: { id: data.mealCategoryId, providerId },
    });

    if (!category)
      throw new ApiError(
        400,
        'Meal category not found or does not belong to this provider',
      );
  }

  const meal = await prisma.meal.create({
    data: {
      name: data.name,
      description: data.description,
      slug,
      price: data.price,
      discount: data.discount,
      discountType: data.discountType ?? null,
      imageUrl: data.imageUrl,
      status: data.status ?? 'AVAILABLE',
      isVegan: data.isVegan ?? false,
      isBestSeller: data.isBestSeller ?? false,
      preparationTime: data.preparationTime,
      providerId,
      mealCategoryId: data.mealCategoryId,
    },
    include: {
      mealCategory: {
        select: {
          id: true,
          name: true,
        },
      },
      provider: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    omit: {
      providerId: true,
      mealCategoryId: true,
    },
  });

  return meal as unknown as Meal;
};

const updateMeal = async (
  id: string,
  providerId: string,
  data: UpdateMeal,
): Promise<Meal> => {
  const meal = await prisma.meal.findFirst({ where: { id, providerId } });
  if (!meal) throw new ApiError(404, 'Meal not found or access denied');

  if (data.mealCategoryId) {
    const category = await prisma.mealCategory.findFirst({
      where: { id: data.mealCategoryId, providerId },
    });

    if (!category)
      throw new ApiError(
        400,
        'Meal category not found or does not belong to this provider',
      );
  }

  const slug = data.name && !data.slug ? generateSlug(data.name) : data.slug;

  const updated = await prisma.meal.update({
    where: { id },
    data: { ...data, ...(slug && { slug }) },
    include: {
      mealCategory: { select: { id: true, name: true } },
      provider: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    omit: {
      providerId: true,
      mealCategoryId: true,
    },
  });

  return updated as unknown as Meal;
};

const updateMealStatus = async (
  id: string,
  providerId: string,
  data: UpdateMealStatus,
): Promise<Meal> => {
  const meal = await prisma.meal.findFirst({ where: { id, providerId } });
  if (!meal) throw new ApiError(404, 'Meal not found or access denied');

  const updated = await prisma.meal.update({
    where: { id },
    data: { status: data.status },
    include: {
      mealCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    omit: {
      providerId: true,
      mealCategoryId: true,
    },
  });

  return updated as unknown as Meal;
};

const deleteMeal = async (id: string, providerId: string): Promise<void> => {
  const meal = await prisma.meal.findUnique({ where: { id, providerId } });

  if (!meal) throw new ApiError(404, 'Meal not found or access denied');

  await prisma.meal.delete({ where: { id } });
};

/* ============ ADMIN (READ-ONLY) ============ */

const findAllMealCategoriesForAdmin = async (
  query: MealCategoryQuery,
): Promise<{ data: MealCategory[]; pagination: PaginationMeta }> => {
  const { name, status } = query?.filter || {};
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = query?.pagination || {};
  const { sortBy = SORT_BY.CREATED_AT, sortType = SORT_TYPE.DESC } =
    query?.sort || {};

  const sanitizedPageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
  const skipAmount = (page - 1) * sanitizedPageSize;

  const where: Prisma.MealCategoryWhereInput = {
    ...(name && { name: { contains: name, mode: 'insensitive' } }),
    ...(status && { status }),
  };

  const [data, total] = await Promise.all([
    prisma.mealCategory.findMany({
      where,
      orderBy: { [sortBy]: sortType },
      take: sanitizedPageSize,
      skip: skipAmount,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      omit: {
        providerId: true,
      },
    }),
    prisma.mealCategory.count({ where }),
  ]);

  const totalPages = Math.ceil(total / sanitizedPageSize);
  const currentPage = Math.floor(skipAmount / sanitizedPageSize) + 1;

  return {
    data: data as unknown as MealCategory[],
    pagination: {
      totalItems: total,
      totalPages,
      currentPage,
      next: currentPage < totalPages ? currentPage + 1 : null,
      prev: currentPage > 1 ? currentPage - 1 : null,
    },
  };
};

const findAllMealsForAdmin = async (
  query: MealQuery,
): Promise<{ data: Meal[]; pagination: PaginationMeta }> => {
  const { name, status, isVegan, isBestSeller } = query?.filter || {};
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = query?.pagination || {};
  const { sortBy = SORT_BY.CREATED_AT, sortType = SORT_TYPE.DESC } =
    query?.sort || {};

  const sanitizedPageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
  const skipAmount = (page - 1) * sanitizedPageSize;

  const where: Prisma.MealWhereInput = {
    ...(name && { name: { contains: name, mode: 'insensitive' } }),
    ...(status && { status }),
    ...(isVegan !== undefined && { isVegan }),
    ...(isBestSeller !== undefined && { isBestSeller }),
  };

  const [data, total] = await Promise.all([
    prisma.meal.findMany({
      where,
      include: {
        mealCategory: {
          select: {
            id: true,
            name: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { [sortBy]: sortType },
      take: sanitizedPageSize,
      skip: skipAmount,
      omit: {
        mealCategoryId: true,
        providerId: true,
      },
    }),
    prisma.meal.count({ where }),
  ]);

  const totalPages = Math.ceil(total / sanitizedPageSize);
  const currentPage = Math.floor(skipAmount / sanitizedPageSize) + 1;

  return {
    data: data as unknown as Meal[],
    pagination: {
      totalItems: total,
      totalPages,
      currentPage,
      next: currentPage < totalPages ? currentPage + 1 : null,
      prev: currentPage > 1 ? currentPage - 1 : null,
    },
  };
};

export const mealService = {
  /* admin (read-only) */
  findAllMealCategoriesForAdmin,
  findAllMealsForAdmin,
  /* meal category */
  findAllMealCategories,
  findMealCategoryById,
  createMealCategory,
  updateMealCategory,
  updateMealCategoryStatus,
  deleteMealCategory,
  /* meal */
  findMealsByProvider,
  findPublicMealsByProvider,
  findMealById,
  createMeal,
  updateMeal,
  updateMealStatus,
  deleteMeal,
};
