import { Prisma } from '../../../generated/prisma/client';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../constants';
import { prisma } from '../../lib/prisma';
import { PaginationMeta } from '../../shared/schemas/pagination.schema';
import { SORT_BY, SORT_TYPE } from '../../shared/schemas/sort.schema';
import { ApiError } from '../../utils/ApiError';
import { userService } from '../user/user.service';
import {
  CreateProviderProfile,
  ProviderProfile,
  ProviderQuery,
  UpdateProviderProfile,
} from './provider.validation';

const findAllProviders = async ({
  filter,
  pagination,
  sort,
}: ProviderQuery): Promise<{
  data: ProviderProfile[];
  pagination: PaginationMeta;
}> => {
  const { name, isOpen } = filter || {};
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = pagination || {};
  const { sortBy = SORT_BY.CREATED_AT, sortType = SORT_TYPE.DESC } = sort || {};

  const sanitizedPageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
  const skipAmount = (page - 1) * sanitizedPageSize;

  const whereClause: Prisma.ProviderProfileWhereInput = {
    ...(name && { name: { contains: name, mode: 'insensitive' } }),
    ...(isOpen !== undefined && { isOpen: { equals: isOpen } }),
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
      deliveryFee: data.deliveryFee,
      deliveryTime: data.deliveryTime,
      minimumOrderAmount: data.minimumOrderAmount,
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
      businessEmail: data.businessEmail,
      phone: data.phone,
      bio: data.bio,
      address: data.address,
      logo: data.logo,
      cover: data.cover,
      openingHours: data.openingHours,
      closingHours: data.closingHours,
      isOpen: data.isOpen,
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

export const providerService = {
  //   getByUserId,
  // getProviderById,
  findProviderByUserId,
  create,
  update,
  // public
  findAllProviders,
  getProviderById,
};
