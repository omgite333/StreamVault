import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { generateAccessToken, generateRefreshToken } from '../utils/token';
import { resolveObjectUrl } from './upload.service';
import * as userRepo from '../repositories/user.repository';

export type OAuthProvider = 'google';

const GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const GOOGLE_SCOPES = 'openid email profile';

export const parseProvider = (value: string): OAuthProvider => {
  if (value !== 'google') {
    throw new ApiError(400, 'Unsupported OAuth provider.');
  }
  return value;
};

const getCredentials = (): { clientId: string; clientSecret: string } => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new ApiError(503, 'Google sign-in is not configured yet.');
  }
  return { clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET };
};

const callbackUrl = () => `${env.CLIENT_URL}/api/auth/oauth/google/callback`;

export const getAuthorizeUrl = () => {
  const { clientId } = getCredentials();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl(),
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    prompt: 'select_account',
  });

  return `${GOOGLE_AUTHORIZE_URL}?${params.toString()}`;
};

interface OAuthProfile {
  providerAccountId: string;
  email: string;
  name: string;
  avatar: string | null;
}

export const handleCallback = async (code: string) => {
  const { clientId, clientSecret } = getCredentials();

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: callbackUrl(),
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new ApiError(401, 'Failed to exchange the authorization code.');
  }

  const profileRes = await fetch(GOOGLE_PROFILE_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profileData = (await profileRes.json()) as {
    id?: string;
    email?: string;
    name?: string;
    picture?: string;
  };

  const profile: OAuthProfile = {
    providerAccountId: profileData.id ?? '',
    email: profileData.email ?? '',
    name: profileData.name ?? profileData.email?.split('@')[0] ?? 'Google User',
    avatar: profileData.picture ?? null,
  };

  if (!profile.email) {
    throw new ApiError(400, "We couldn't find an email on your Google account.");
  }
  if (!profile.providerAccountId) {
    throw new ApiError(400, "We couldn't identify your Google account.");
  }

  let user = await userRepo.findUserByOAuthAccount('google', profile.providerAccountId);
  let created = false;

  if (!user) {
    const existingByEmail = await userRepo.findUserByEmail(profile.email);
    if (existingByEmail) {
      await userRepo.linkOAuthAccount(existingByEmail.id, {
        provider: 'google',
        providerAccountId: profile.providerAccountId,
      });
      user = await userRepo.findPublicUserById(existingByEmail.id);
    } else {
      user = await userRepo.createOAuthUser({
        name: profile.name,
        email: profile.email,
        profileImage: profile.avatar,
        provider: 'google',
        providerAccountId: profile.providerAccountId,
      });
      created = true;
    }
  }

  if (!user) {
    throw new ApiError(500, 'Failed to sign in with Google.');
  }

  return {
    user: await withSignedAvatar(user),
    ...issueTokens(user),
    created,
  };
};

const issueTokens = (user: { id: string; role: string }) => ({
  accessToken: generateAccessToken({ userId: user.id, role: user.role }),
  refreshToken: generateRefreshToken({ userId: user.id, role: user.role }),
});

const withSignedAvatar = async (user: { profileImage: string | null }) => ({
  ...user,
  profileImageUrl: await resolveObjectUrl(user.profileImage),
});
