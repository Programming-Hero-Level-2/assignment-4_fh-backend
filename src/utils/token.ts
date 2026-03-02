// import jwt, { Jwt } from 'jsonwebtoken';
import jwt, { SignOptions, Algorithm, JwtPayload } from 'jsonwebtoken';
import { ApiError } from './ApiError';
import { ENV } from '../config/env';

export interface GenerateTokenOptions {
  payload: JwtPayload;
  secret?: string;
  algorithm?: Algorithm;
  expiresIn?: JwtPayload['exp'];
}

export const generateToken = ({
  payload,
  secret = ENV.ACCESS_TOKEN_SECRET,
  algorithm = 'HS256',
  expiresIn = 7 * 24 * 60 * 60,
}: {
  payload: jwt.JwtPayload | string;
  secret?: string;
  algorithm?: jwt.Algorithm;
  expiresIn?: number;
}) => {
  try {
    return jwt.sign(payload, secret || '', {
      expiresIn: expiresIn,
      algorithm: algorithm,
    });
  } catch (error) {
    console.log('[JWT] Token generation error:: ', error);
    throw new ApiError(500, 'Internal Server Error');
  }
};

export interface VerifyTokenOptions {
  token: string;
  secret?: string;
  algorithms?: Algorithm;
}

export const verifyToken = ({
  token,
  secret = ENV.ACCESS_TOKEN_SECRET,
  algorithms = 'HS256',
}: VerifyTokenOptions): JwtPayload | string => {
  try {
    return jwt.verify(token, secret || '', { algorithms: [algorithms] });
  } catch (error) {
    console.log('[JWT] Token verification error:: ', error);
    throw new ApiError(401, 'Invalid or expired token');
  }
};

export interface DecodeTokenOptions {
  token: string;
}
export const decodeToken = ({
  token,
  algorithm = 'HS256',
}: {
  token: string;
  algorithm?: jwt.Algorithm;
}) => {
  try {
    return jwt.decode(token, algorithm as jwt.DecodeOptions);
  } catch (error) {
    console.log('[JWT] Token decoding error:: ', error);
    throw new ApiError(400, 'Invalid token');
  }
};
