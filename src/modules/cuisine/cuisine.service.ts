import { Prisma } from '../../../generated/prisma/client';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../constants';
import { prisma } from '../../lib/prisma';
import { PaginationMeta } from '../../shared/schemas/pagination.schema';
import { SORT_BY, SORT_TYPE } from '../../shared/schemas/sort.schema';
import { ApiError } from '../../utils/ApiError';
import {
  CategoryStatus,
  Cuisine,
  CreateCuisine,
  CuisineQuery,
  UpdateCuisine,
  UpdateCuisineStatus,
} from './cuisine.validation';

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

const findAll = async ({
  filter,
  pagination,
  sort,
}: CuisineQuery): Promise<{ data: Cuisine[]; pagination: PaginationMeta }> => {
  const { name, status } = filter || {};
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = pagination || {};
  const { sortBy = SORT_BY.CREATED_AT, sortType = SORT_TYPE.DESC } = sort || {};

  const sanitizedPageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
  const skipAmount = (page - 1) * sanitizedPageSize;

  const whereClause: Prisma.CuisineWhereInput = {
    ...(name && { name: { contains: name, mode: 'insensitive' } }),
    ...(status && { status: { in: [status] } }),
  };

  const [cuisines, total] = await Promise.all([
    prisma.cuisine.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortType },
      take: sanitizedPageSize,
      skip: skipAmount,
    }),
    prisma.cuisine.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / sanitizedPageSize);
  const currentPage = Math.floor(skipAmount / sanitizedPageSize) + 1;

  return {
    data: cuisines as unknown as Cuisine[],
    pagination: {
      totalItems: total,
      totalPages,
      currentPage,
      next: currentPage < totalPages ? currentPage + 1 : null,
      prev: currentPage > 1 ? currentPage - 1 : null,
    },
  };
};

const findById = async (id: string): Promise<Cuisine> => {
  const cuisine = await prisma.cuisine.findUnique({ where: { id } });
  if (!cuisine) throw new ApiError(404, 'Cuisine not found');
  return cuisine as unknown as Cuisine;
};

const create = async (data: CreateCuisine): Promise<Cuisine> => {
  const slug = data.slug ?? generateSlug(data.name);

  const existing = await prisma.cuisine.findFirst({
    where: { OR: [{ name: data.name }, { slug }] },
  });
  if (existing)
    throw new ApiError(409, 'Cuisine with this name or slug already exists');

  const cuisine = await prisma.cuisine.create({
    data: {
      name: data.name,
      description: data.description,
      slug,
      imageUrl: data.imageUrl,
      status: data.status ?? CategoryStatus.ACTIVE,
    },
  });

  return cuisine as unknown as Cuisine;
};

const update = async (id: string, data: UpdateCuisine): Promise<Cuisine> => {
  await findById(id);

  const slug = data.name && !data.slug ? generateSlug(data.name) : data.slug;

  const cuisine = await prisma.cuisine.update({
    where: { id },
    data: {
      ...data,
      ...(slug && { slug }),
    },
  });

  return cuisine as unknown as Cuisine;
};

const updateStatus = async (
  id: string,
  data: UpdateCuisineStatus,
): Promise<Cuisine> => {
  await findById(id);

  const cuisine = await prisma.cuisine.update({
    where: { id },
    data: { status: data.status },
  });

  return cuisine as unknown as Cuisine;
};

const remove = async (id: string): Promise<void> => {
  await findById(id);
  await prisma.cuisine.delete({ where: { id } });
};

export const cuisineService = {
  findAll,
  findById,
  create,
  update,
  updateStatus,
  remove,
};
