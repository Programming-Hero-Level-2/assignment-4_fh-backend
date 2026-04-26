import { Prisma } from '../../../generated/prisma/client';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../constants';
import { prisma } from '../../lib/prisma';
import { PaginationMeta } from '../../shared/schemas/pagination.schema';
import { SORT_BY, SORT_TYPE } from '../../shared/schemas/sort.schema';
import { ApiError } from '../../utils/ApiError';
import { generateSlug } from '../../utils/slug';
import { userService } from '../user/user.service';
import {
  CreateProviderProfile,
  ProviderProfile,
  ProviderQuery,
  UpdateProviderProfile,
} from './provider.validation';

const PRICE_TIER_RANGE: Record<
  'budget' | 'mid' | 'premium',
  Prisma.FloatFilter
> = {
  budget: { lte: 300 },
  mid: { gt: 300, lte: 700 },
  premium: { gt: 700 },
};

const findAllProviders = async ({
  filter,
  pagination,
  sort,
}: ProviderQuery): Promise<{
  data: ProviderProfile[];
  pagination: PaginationMeta;
}> => {
  const { name, isOpen, category, isVeg, rating, maxDeliveryTime, priceRange } =
    filter || {};
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = pagination || {};
  const { sortBy = SORT_BY.CREATED_AT, sortType = SORT_TYPE.DESC } = sort || {};

  const sanitizedPageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
  const skipAmount = (page - 1) * sanitizedPageSize;

  let whereClause: Prisma.ProviderProfileWhereInput = {
    ...(name && { name: { contains: name, mode: 'insensitive' } }),
    ...(isOpen !== undefined && { isOpen: { equals: isOpen } }),
    ...(category &&
      category.length > 0 && {
        // AND: [
        //   {
        //     cuisines: {
        //       some: {
        //         name: {
        //           in: [
        //             'japanese',
        //             'mediterranean',
        //             'italian',
        //             'indian',
        //             'mexican',
        //             'chinese',
        //           ],
        //           mode: 'insensitive',
        //         },
        //       },
        //     },
        //   },
        // ],
        AND: category.map((cat) => ({
          cuisines: {
            some: {
              name: {
                equals: cat,
                mode: 'insensitive',
              },
            },
          },
        })),
      }),
    ...(isVeg !== undefined &&
      isVeg && {
        meals: {
          some: {
            isVegan: true,
            status: 'AVAILABLE',
          },
        },
      }),
    ...(maxDeliveryTime !== undefined && {
      deliveryTime: { lte: maxDeliveryTime },
    }),
    ...(priceRange && {
      minimumOrderAmount: PRICE_TIER_RANGE[priceRange],
    }),
  };

  if (rating !== undefined) {
    const ratingGroups = await prisma.review.groupBy({
      by: ['providerId'],
      _avg: { rating: true },
      having: {
        rating: {
          _avg: {
            gte: rating,
          },
        },
      },
    });

    const providerIds = ratingGroups.map((group) => group.providerId);

    if (!providerIds.length) {
      return {
        data: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
          next: null,
          prev: null,
        },
      };
    }

    whereClause = {
      ...whereClause,
      id: { in: providerIds },
    };
  }

  const providers = await prisma.providerProfile.findMany({
    where: whereClause,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      },
      cuisines: {
        // where: {
        //   some: {
        //     name: { contains: category, mode: 'insensitive' },
        //   },
        // },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    omit: {
      ownerId: true,
    },
    skip: skipAmount,
    take: sanitizedPageSize,
    orderBy: { [sortBy]: sortType },
  });

  const total = await prisma.providerProfile.count({ where: whereClause });

  const totalPages = Math.ceil(total / sanitizedPageSize);
  const currentPage = Math.floor(skipAmount / sanitizedPageSize) + 1;
  console.log('providers:>>', providers);
  return {
    data: providers,
    pagination: {
      totalItems: total,
      totalPages,
      currentPage,
      next: currentPage < totalPages ? currentPage + 1 : null,
      prev: currentPage > 1 ? currentPage - 1 : null,
    },
  };
};

const findProviderByUserId = async (userId: string) => {
  const profile = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      providerProfile: {
        include: {
          cuisines: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    omit: {
      id: true,
      email: true,
      name: true,
      password: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  console.log('User profile retrieved for userId:', userId, profile);
  return profile ? profile.providerProfile : null;
};

const getProviderById = async (id: string) => {
  const providerProfile = await prisma.providerProfile.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      },
      cuisines: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    omit: {
      ownerId: false,
    },
  });

  return providerProfile ? providerProfile : null;
};

const create = async (
  userId: string,
  data: CreateProviderProfile,
): Promise<ProviderProfile> => {
  const existingUser = await userService.findById(userId);
  if (!existingUser) {
    throw new ApiError(404, 'User not found');
  }
  const existingProfile = await findProviderByUserId(userId);
  if (existingProfile) {
    throw new ApiError(400, 'Provider Profile already exists for this user');
  }

  if (data.cuisineIds?.length) {
    const foundCuisines = await prisma.cuisine.findMany({
      where: { id: { in: data.cuisineIds } },
      select: { id: true },
    });
    if (foundCuisines.length !== data.cuisineIds.length) {
      const foundIds = foundCuisines.map((c) => c.id);
      const missing = data.cuisineIds.filter((id) => !foundIds.includes(id));
      throw new ApiError(400, `Cuisines not found: ${missing.join(', ')}`);
    }
  }

  const profile = await prisma.providerProfile.create({
    data: {
      name: data.name,
      businessEmail: data.businessEmail,
      phone: data.phone,
      bio: data.bio,
      address: data.address,
      logo: data.logo,
      cover: data.cover,
      openingHours: data.openingHours,
      closingHours: data.closingHours,
      isOpen: data.isOpen,
      isFeatured: data.isFeatured,
      deliveryFee: data.deliveryFee,
      deliveryTime: data.deliveryTime,
      minimumOrderAmount: data.minimumOrderAmount,
      slug: generateSlug(data.name),
      ownerId: userId,
      ...(data.cuisineIds?.length && {
        cuisines: {
          connect: data.cuisineIds.map((id) => ({
            id: id,
          })),
        },
      }),
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      },
      cuisines: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!profile) {
    throw new ApiError(500, 'Failed to create Provider Profile');
  }

  return profile;
};

const update = async (
  id: string,
  data: UpdateProviderProfile & { categoryIds?: string[] },
): Promise<ProviderProfile> => {
  const existingProfile = await getProviderById(id);
  if (!existingProfile) {
    throw new ApiError(404, 'Provider Profile not found');
  }

  if (data.cuisineIds?.length) {
    const foundCuisines = await prisma.cuisine.findMany({
      where: { id: { in: data.cuisineIds } },
      select: { id: true },
    });
    if (foundCuisines.length !== data.cuisineIds.length) {
      const foundIds = foundCuisines.map((c) => c.id);
      const missing = data.cuisineIds.filter((id) => !foundIds.includes(id));
      throw new ApiError(400, `Cuisines not found: ${missing.join(', ')}`);
    }
  }
  const profile = await prisma.providerProfile.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.name ? generateSlug(data.name) : existingProfile.slug,
      businessEmail: data.businessEmail,
      phone: data.phone,
      bio: data.bio,
      address: data.address,
      logo: data.logo,
      cover: data.cover,
      openingHours: data.openingHours,
      closingHours: data.closingHours,
      isOpen: data.isOpen,
      isFeatured: data.isFeatured,
      deliveryFee: data.deliveryFee,
      deliveryTime: data.deliveryTime,
      minimumOrderAmount: data.minimumOrderAmount,
      ...(data.cuisineIds?.length && {
        cuisines: {
          connect: data.cuisineIds.map((id) => ({
            id: id,
          })),
        },
      }),
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      },
      cuisines: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!profile) {
    throw new ApiError(500, 'Failed to update Provider Profile');
  }

  return profile;
};

const findAllFeaturedProviders = async ({
  pagination,
  sort,
}: ProviderQuery): Promise<{
  data: ProviderProfile[];
  pagination: PaginationMeta;
}> => {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = pagination || {};
  const { sortBy = SORT_BY.CREATED_AT, sortType = SORT_TYPE.DESC } = sort || {};

  const sanitizedPageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
  const skipAmount = (page - 1) * sanitizedPageSize;

  const whereClause: Prisma.ProviderProfileWhereInput = {
    isFeatured: true,
  };

  const providers = await prisma.providerProfile.findMany({
    where: whereClause,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      },
      cuisines: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    omit: {
      ownerId: true,
    },
    skip: skipAmount,
    take: sanitizedPageSize,
    orderBy: { [sortBy]: sortType },
  });

  const total = await prisma.providerProfile.count({ where: whereClause });
  const totalPages = Math.ceil(total / sanitizedPageSize);
  const currentPage = Math.floor(skipAmount / sanitizedPageSize) + 1;

  return {
    data: providers,
    pagination: {
      totalItems: total,
      totalPages,
      currentPage,
      next: currentPage < totalPages ? currentPage + 1 : null,
      prev: currentPage > 1 ? currentPage - 1 : null,
    },
  };
};

export const providerService = {
  //   getByUserId,
  // getProviderById,
  findProviderByUserId,
  create,
  update,
  // public
  findAllProviders,
  findAllFeaturedProviders,
  getProviderById,
};
