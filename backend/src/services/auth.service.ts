import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/ApiError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, type TokenPayload } from '../utils/token';
import { resolveObjectUrl } from './upload.service';
import * as userRepo from '../repositories/user.repository';
import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from '../validations/auth.validation';

const issueTokens = (user: { id: string; role: string }) => ({
  accessToken: generateAccessToken({ userId: user.id, role: user.role }),
  refreshToken: generateRefreshToken({ userId: user.id, role: user.role }),
});

const toPublic = (user: {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STUDENT';
  profileImage: string | null;
  isVerified: boolean;
  createdAt: Date;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

const withSignedAvatar = async (user: { profileImage: string | null }) => ({
  ...user,
  profileImageUrl: await resolveObjectUrl(user.profileImage),
});

export const register = async (input: RegisterInput) => {
  const existing = await userRepo.findUserByEmail(input.email);
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);
  const user = await userRepo.createUser({
    name: input.name,
    email: input.email,
    password: hashedPassword,
  });

  return { user, ...issueTokens(user) };
};

export const login = async (input: LoginInput) => {
  const user = await userRepo.findUserByEmail(input.email);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }
  if (!user.password) {
    throw new ApiError(401, 'This account uses social sign-in. Please continue with Google or GitHub.');
  }

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const userWithAvatar = await withSignedAvatar(toPublic(user));
  return { user: userWithAvatar, ...issueTokens(user) };
};

export const refresh = async (refreshToken: string) => {
  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token.');
  }

  const user = await userRepo.findPublicUserById(payload.userId);
  if (!user) {
    throw new ApiError(401, 'User account no longer exists.');
  }

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const userWithAvatar = await withSignedAvatar(user);
  return { user: userWithAvatar, accessToken };
};

export const getUserById = async (id: string) => {
  const user = await userRepo.findPublicUserById(id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  return withSignedAvatar(user);
};

export const updateProfile = async (userId: string, input: UpdateProfileInput) => {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const updated = await userRepo.updateUser(userId, {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.profileImage !== undefined ? { profileImage: input.profileImage } : {}),
  });

  return withSignedAvatar(updated);
};

export const changePassword = async (userId: string, input: ChangePasswordInput) => {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  if (user.password) {
    const valid = await bcrypt.compare(input.currentPassword ?? '', user.password);
    if (!valid) {
      throw new ApiError(400, 'Current password is incorrect.');
    }
  }

  const hashed = await bcrypt.hash(input.newPassword, 10);
  await userRepo.updateUserPassword(userId, hashed);
};
