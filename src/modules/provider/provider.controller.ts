import { IDSchema } from '../../shared/schemas/id.schema';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { generatePageLink } from '../../utils/generatePageLink';
import { providerService } from './provider.service';
import {
  CreateProviderProfileSchema,
  ProviderQuerySchema,
  UpdateProviderProfileSchema,
} from './provider.validation';

/* --- PUBLIC --- */

const findAllPublicProviders = asyncHandler(async (req, res) => {
  const queryParams = ProviderQuerySchema.parse({
    filter: {
      name: req.query.name,
      isOpen: req.query.isOpen && req.query.isOpen === 'true',
    },
    pagination: {
      page: req.query.page && Number(req.query.page),
      pageSize: req.query.pageSize && Number(req.query.pageSize),
    },
    sort: {
      sortBy: req.query.sortBy,
      sortType: req.query.sortType,
    },
  });
  const providers = await providerService.findAllProviders(queryParams);

  const ProvidersDTO = providers.data.map((provider) => ({
    id: provider.id,
    name: provider.name,
    cover: provider.cover,
    logo: provider.logo,
    isOpen: provider.isOpen,
    deliveryTime: provider.deliveryTime,
    deliveryFee: provider.deliveryFee,
    minimumOrder: provider.minimumOrderAmount,
    cuisines: provider.cuisines?.map((cuisine) => cuisine.name) || [],
  }));

  const response = {
    providers: ProvidersDTO,
    pagination: providers.pagination,
    links: {
      self: req.originalUrl,
      next: generatePageLink(req.originalUrl, providers.pagination.next),
      prev: generatePageLink(req.originalUrl, providers.pagination.prev),
    },
  };

  res
    .status(200)
    .json(new ApiResponse(200, 'Providers retrieved successfully', response));
});

const getPublicProviderById = asyncHandler(async (req, res) => {
  const id = IDSchema.parse(req.params.id);
  const provider = await providerService.getProviderById(id);
  if (!provider) {
    throw new ApiError(404, 'Provider not found');
  }
  const response = {
    id: provider.id,
    name: provider.name,
    cover: provider.cover,
    logo: provider.logo,
    isOpen: provider.isOpen,
    deliveryTime: provider.deliveryTime,
    deliveryFee: provider.deliveryFee,
    minimumOrder: provider.minimumOrderAmount,
    cuisines: provider.cuisines?.map((cuisine) => cuisine.name) || [],
    address: provider.address,
  };

  res
    .status(200)
    .json(new ApiResponse(200, 'Provider retrieved successfully', response));
});

/* --- PROVIDER-ONLY --- */

const findProviderByUserId = asyncHandler(async (req, res) => {
  const userId = IDSchema.parse(req.user?.userId);

  const providerProfile = await providerService.findProviderByUserId(userId);

  if (!providerProfile) {
    throw new ApiError(404, 'Provider Profile not found');
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, 'Provider retrieved successfully', providerProfile),
    );
});

const createProvideProfile = asyncHandler(async (req, res) => {
  const providerData = req.body;

  const data = CreateProviderProfileSchema.parse(req.body);

  // userId should come from authenticated user context, not from request body
  const newProfile = await providerService.create(providerData.userId, data);
  res
    .status(201)
    .json(
      new ApiResponse(201, 'Provider Profile created successfully', newProfile),
    );
});

const updateProviderProfile = asyncHandler(async (req, res) => {
  const providerId = IDSchema.parse(req.params.userId);

  const data = UpdateProviderProfileSchema.parse(req.body);
  const updatedProfile = await providerService.update(providerId, data);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        'Provider Profile updated successfully',
        updatedProfile,
      ),
    );
});

/* --- ADMIN-ONLY --- */

const getAdminProviderById = asyncHandler(async (req, res) => {
  const id = IDSchema.parse(req.params.id as string);
  const provider = await providerService.getProviderById(id);
  if (!provider) {
    throw new ApiError(404, 'Provider not found');
  }

  const response = {
    id: provider.id,
    name: provider.name,
    address: provider.address,
    owner: provider.owner.name,
    email: provider.owner.email,
    joinedAt: provider.createdAt,
  };

  res
    .status(200)
    .json(new ApiResponse(200, 'Provider retrieved successfully', response));
});

const findAllAdminProviders = asyncHandler(async (req, res) => {
  const queryParams = ProviderQuerySchema.parse({
    filter: {
      name: req.query.name,
      isOpen: req.query.isOpen && req.query.isOpen === 'true',
    },
    pagination: {
      page: req.query.page && Number(req.query.page),
      pageSize: req.query.pageSize && Number(req.query.pageSize),
    },
    sort: {
      sortBy: req.query.sortBy,
      sortType: req.query.sortType,
    },
  });

  const providers = await providerService.findAllProviders(queryParams);

  const response = providers.data.map((provider) => ({
    id: provider.id,
    name: provider.name,
    address: provider.address,
    owner: provider.owner.name,
    email: provider.owner.email,
    joinedAt: provider.createdAt,
    isOpen: provider.isOpen,
  }));

  res.status(200).json(
    new ApiResponse(200, 'Providers retrieved successfully', {
      providers: response,
      pagination: providers.pagination,
      links: {
        self: req.originalUrl,
        next: generatePageLink(req.originalUrl, providers.pagination.next),
        prev: generatePageLink(req.originalUrl, providers.pagination.prev),
      },
    }),
  );
});

export const providerController = {
  /* provider-only */
  findProviderByUserId,
  createProvideProfile,
  updateProviderProfile,
  /* public */
  findAllPublicProviders,
  getPublicProviderById,

  /* admin-only */
  findAllAdminProviders,
  getAdminProviderById,
};
