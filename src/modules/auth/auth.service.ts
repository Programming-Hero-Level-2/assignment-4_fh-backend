import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import { hashMatched } from '../../utils/hashing';
import { generateToken } from '../../utils/token';
import { userService } from '../user/user.service';
import { CreateUser, Role, User, UserStatus } from '../user/user.validation';

const registerUser = async ({
  name,
  email,
  password,
  role = Role.CUSTOMER,
  status = UserStatus.ACTIVE,
}: CreateUser): Promise<Omit<User, 'password'>> => {
  const existingUser = await userService.userExist(email);

  if (existingUser) {
    throw new ApiError(409, 'User already registered');
  }

  const user = await userService.create({
    data: {
      name,
      email,
      password,
      role,
      status,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  if (!user) {
    throw new ApiError(500, 'Failed to register user');
  }

  return user;
};

const loginUser = async (
  email: string,
  password: string,
): Promise<{
  user: Omit<User, 'password' | 'createdAt' | 'updatedAt'>;
  accessToken: string;
}> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new ApiError(404, 'User not found');

  const passwordMatched = await hashMatched(password, user.password);

  if (!passwordMatched) throw new ApiError(401, 'Invalid credentials');

  const accessToken = generateToken({
    payload: { userId: user.id, role: user.role },
    expiresIn: 60 * 60, // 1 hour
  });

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};

export const authService = {
  registerUser,
  loginUser,
};
