import { urlencoded } from 'express';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

import { userService } from './user.service';
import { generatePageLink } from '../../utils/generatePageLink';
import { ApiError } from '../../utils/ApiError';
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserQuerySchema,
} from './user.validation';
import { IDSchema } from '../../shared/schemas/id.schema';

const createUser = asyncHandler(async (req, res, _next) => {
  const data = CreateUserSchema.parse(req.body);

  const user = await userService.create({ data: data });

  res.status(201).json(new ApiResponse(201, 'User created successfully', user));
});

const getAllUsers = asyncHandler(async (req, res, _next) => {
  const queryParams = UserQuerySchema.parse({
    filter: {
      name: req.query.name && req.query.name,
      role: req.query.role && req.query.role,
      status: req.query.status && req.query.status,
    },
    pagination: {
      page: req.query.page && Number(req.query.page),
      pageSize: req.query.pageSize && Number(req.query.pageSize),
    },
    sort: {
      sortBy: req.query.sortBy && req.query.sortBy,
      sortType: req.query.sortType && req.query.sortType,
    },
  });

  const { data, pagination } = await userService.getAllUsers(queryParams);
  res.status(200).json(
    new ApiResponse(200, 'Users retrieved successfully', {
      user: data,
      pagination,
      links: {
        self: req.originalUrl,
        next: generatePageLink(req.originalUrl, pagination.next),
        prev: generatePageLink(req.originalUrl, pagination.prev),
      },
    }),
  );
});

const getUser = asyncHandler(async (req, res, _next) => {
  const id = IDSchema.parse(req.params.id);

  const user = await userService.findById(id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res
    .status(200)
    .json(new ApiResponse(200, 'User retrieved successfully', user));
});

const updateUser = asyncHandler(async (req, res, _next) => {
  const id = IDSchema.parse(req.params.id);
  const data = UpdateUserSchema.partial().parse(req.body);

  const updatedUser = await userService.update(id, data);
  res
    .status(200)
    .json(new ApiResponse(200, 'User updated successfully', updatedUser));
});

const deleteUser = asyncHandler(async (req, res, _next) => {
  const id = IDSchema.parse(req.params.id);

  await userService.deleteUser(id);

  res.status(200).json(new ApiResponse(200, 'User deleted successfully', null));
});

export const userController = {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
};
