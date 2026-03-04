import { Prisma } from '../../../generated/prisma/client';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../constants';
import { prisma } from '../../lib/prisma';
import { PaginationMeta } from '../../shared/schemas/pagination.schema';
import { SORT_BY, SORT_TYPE } from '../../shared/schemas/sort.schema';
import { ApiError } from '../../utils/ApiError';
import { generateHash } from '../../utils/hashing';
import {
  CreateUser,
  Role,
  UpdateUser,
  User,
  UserQuery,
  UserStatus,
} from './user.validation';

const findUserByEmail = async (
  email: string,
): Promise<(User & { password: string }) | null> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  return user ? user : null;
};

const userExist = async (email: string): Promise<boolean> => {
  const user = await findUserByEmail(email);
  return !!user;
};

const findByEmail = async (
  email: string,
): Promise<Omit<User, 'password'> | null> => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user ? user : null;
};

const create = async ({
  data,
  select,
}: {
  data: CreateUser;
  select?: Prisma.UserSelect;
}): Promise<User> => {
  const existingUser = await userExist(data.email);

  if (existingUser) {
    throw new ApiError(409, 'User already registered');
  }
  const hashedPassword = await generateHash(data.password);

  const createdUser = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role ?? Role.CUSTOMER,
      status: data.status ?? UserStatus.ACTIVE,
    },
    select,
  });

  if (!createdUser) {
    throw new ApiError(500, 'Failed to create user');
  }
  return createdUser;
};

const getAllUsers = async ({
  filter,
  pagination,
  sort,
}: UserQuery): Promise<{
  data: Omit<User, 'password'>[];
  pagination: PaginationMeta;
}> => {
  const { name, role, status } = filter || {};
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = pagination || {};
  const { sortBy = SORT_BY.CREATED_AT, sortType = SORT_TYPE.DESC } = sort || {};

  const sanitizedPageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
  const skipAmount = (page - 1) * sanitizedPageSize;

  const whereClause: Prisma.UserWhereInput = {
    ...(name && {
      name: {
        mode: 'insensitive',
        contains: name,
      },
    }),
    ...(role && { role: { in: [role] } }),
    ...(status && { status: { in: [status] } }),
  };

  const users = await prisma.user.findMany({
    where: whereClause,
    orderBy: {
      [sortBy]: sortType,
    },
    take: pageSize,
    skip: skipAmount,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  const total = await prisma.user.count({ where: whereClause });
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(skipAmount / pageSize) + 1;
  console.log(
    'Total users:',
    total,
    'Total pages:',
    totalPages,
    'Current page:',
    currentPage,
  );
  return {
    data: users,
    pagination: {
      totalItems: total,
      totalPages,
      currentPage,
      next: currentPage < totalPages ? currentPage + 1 : null,
      prev: currentPage > 1 ? currentPage - 1 : null,
    },
  };
};
const findById = async (id: string): Promise<Omit<User, 'password'> | null> => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user ? user : null;
};

const update = async (
  id: string,
  payload: UpdateUser,
): Promise<Omit<User, 'password'> | null> => {
  const isUserExist = await findById(id);

  if (!isUserExist) {
    throw new ApiError(404, 'User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!updatedUser) {
    throw new ApiError(500, 'Failed to update user');
  }

  return updatedUser;
};

const deleteUser = async (id: string): Promise<Omit<User, 'password'>> => {
  const isUserExist = await findById(id);

  if (!isUserExist) {
    throw new ApiError(404, 'User not found');
  }

  const deletedUser = await prisma.user.delete({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!deletedUser) {
    throw new ApiError(500, 'Failed to delete user');
  }

  return deletedUser;
};

export const userService = {
  findUserByEmail,
  userExist,
  create,
  findById,
  findByEmail,
  update,
  deleteUser,
  getAllUsers,
};
