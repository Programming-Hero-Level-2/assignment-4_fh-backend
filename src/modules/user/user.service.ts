import { Prisma } from '../../../generated/prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import { generateHash } from '../../utils/hashing';
import { CreateUser, Role, User, UserStatus } from './user.validation';

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

export const userService = {
  findUserByEmail,
  userExist,
  create,
};
