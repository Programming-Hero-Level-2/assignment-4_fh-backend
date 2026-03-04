import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { Role, UserStatus } from '../user/user.validation';
import { authService } from './auth.service';
import { authValidationSchema } from './auth.validation';

const login = asyncHandler(async (req, res) => {
  const { email, password } = authValidationSchema.loginSchema.parse(req.body);
  const { user, accessToken } = await authService.loginUser(email, password);

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: false, // 🔥 IMPORTANT for localhost
    sameSite: 'lax', // 🔥 change from 'none'
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, 'Login successful', { accessToken: accessToken }),
    );
});

const customerRegister = asyncHandler(async (req, res) => {
  const { name, email, password } = authValidationSchema.RegisterSchema.parse(
    req.body,
  );
  const user = await authService.registerUser({
    name,
    email,
    password,
    role: Role.CUSTOMER,
    status: UserStatus.ACTIVE,
  });

  res
    .status(201)
    .json(new ApiResponse(201, 'Customer registered successfully', user));
});

const providerSignup = asyncHandler(async (req, res) => {
  const { name, email, password } = authValidationSchema.RegisterSchema.parse(
    req.body,
  );
  const user = await authService.registerUser({
    name,
    email,
    password,
    role: Role.PROVIDER,
    status: UserStatus.ACTIVE,
  });
  res
    .status(201)
    .json(new ApiResponse(201, 'Provider registered successfully', user));
});

export const authController = {
  login,
  customerRegister,
  providerSignup,
};
