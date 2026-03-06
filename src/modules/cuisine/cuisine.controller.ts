import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { generatePageLink } from '../../utils/generatePageLink';
import { IDSchema } from '../../shared/schemas/id.schema';
import {
  CreateCuisineSchema,
  CuisineQuerySchema,
  UpdateCuisineSchema,
  UpdateCuisineStatusSchema,
} from './cuisine.validation';
import { cuisineService } from './cuisine.service';

const getAllCuisines = asyncHandler(async (req, res) => {
  const queryParams = CuisineQuerySchema.parse({
    filter: {
      name: req.query.name,
      status: req.query.status,
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

  const { data, pagination } = await cuisineService.findAll(queryParams);

  res.status(200).json(
    new ApiResponse(200, 'Cuisines retrieved successfully', {
      cuisines: data,
      pagination,
      links: {
        self: req.originalUrl,
        next: generatePageLink(req.originalUrl, pagination.next),
        prev: generatePageLink(req.originalUrl, pagination.prev),
      },
    }),
  );
});

const getCuisine = asyncHandler(async (req, res) => {
  const id = IDSchema.parse(req.params.id);
  const cuisine = await cuisineService.findById(id);
  res
    .status(200)
    .json(new ApiResponse(200, 'Cuisine retrieved successfully', cuisine));
});

const createCuisine = asyncHandler(async (req, res) => {
  const data = CreateCuisineSchema.parse(req.body);
  const cuisine = await cuisineService.create(data);
  res
    .status(201)
    .json(new ApiResponse(201, 'Cuisine created successfully', cuisine));
});

const updateCuisine = asyncHandler(async (req, res) => {
  const id = IDSchema.parse(req.params.id);
  const data = UpdateCuisineSchema.parse(req.body);
  const cuisine = await cuisineService.update(id, data);
  res
    .status(200)
    .json(new ApiResponse(200, 'Cuisine updated successfully', cuisine));
});

const updateCuisineStatus = asyncHandler(async (req, res) => {
  const id = IDSchema.parse(req.params.id);
  const data = UpdateCuisineStatusSchema.parse(req.body);
  const cuisine = await cuisineService.updateStatus(id, data);
  res
    .status(200)
    .json(new ApiResponse(200, 'Cuisine status updated successfully', cuisine));
});

const deleteCuisine = asyncHandler(async (req, res) => {
  const id = IDSchema.parse(req.params.id);
  await cuisineService.remove(id);
  res
    .status(200)
    .json(new ApiResponse(200, 'Cuisine deleted successfully', null));
});

export const cuisineController = {
  getAllCuisines,
  getCuisine,
  createCuisine,
  updateCuisine,
  updateCuisineStatus,
  deleteCuisine,
};
