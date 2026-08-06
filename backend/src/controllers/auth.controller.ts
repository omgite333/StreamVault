import { CookieOptions, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { logger } from '../config/logger';
import * as authService from '../services/auth.service';
import * as oauthService from '../services/oauth.service';

export const REFRESH_COOKIE = 'refreshToken';

const cookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());
  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: { user, accessToken },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());
  res.json({
    success: true,
    message: 'Logged in successfully.',
    data: { user, accessToken },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  logger.info({ userId: req.user?.id }, 'User logged out');
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
  res.json({ success: true, message: 'Logged out successfully.', data: null });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    throw new ApiError(401, 'No refresh token provided.');
  }

  const { user, accessToken } = await authService.refresh(token);
  res.json({ success: true, message: 'Token refreshed.', data: { user, accessToken } });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getUserById(req.user!.id);
  res.json({ success: true, message: 'User fetched.', data: { user } });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.updateProfile(req.user!.id, req.body);
  res.json({ success: true, message: 'Profile updated.', data: { user } });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.changePassword(req.user!.id, req.body);
  res.json({ success: true, message: 'Password changed successfully.', data: null });
});

export const oauthRedirect = asyncHandler(async (req: Request, res: Response) => {
  const provider = oauthService.parseProvider(req.params.provider as string);
  const url = oauthService.getAuthorizeUrl();
  logger.info({ provider }, 'OAuth authorization URL requested');
  res.json({ success: true, message: 'OAuth URL generated.', data: { url } });
});

export const oauthCallback = asyncHandler(async (req: Request, res: Response) => {
  const provider = oauthService.parseProvider(req.params.provider as string);
  const code = req.query.code as string | undefined;

  if (!code) {
    logger.warn({ provider }, 'OAuth callback missing authorization code');
    return res.redirect(`${env.CLIENT_URL}/oauth/callback?error=${encodeURIComponent('Missing authorization code.')}`);
  }

  try {
    const { accessToken, refreshToken } = await oauthService.handleCallback(code);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());
    res.redirect(`${env.CLIENT_URL}/oauth/callback?accessToken=${encodeURIComponent(accessToken)}`);
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'OAuth sign-in failed.';
    logger.warn({ provider, error: message }, 'OAuth callback failed');
    res.redirect(`${env.CLIENT_URL}/oauth/callback?error=${encodeURIComponent(message)}`);
  }
});
