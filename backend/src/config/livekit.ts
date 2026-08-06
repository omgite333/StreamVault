import { AccessToken, EgressClient, RoomServiceClient } from 'livekit-server-sdk';
import { env } from './env';
import { ApiError } from '../utils/ApiError';
import { logger } from './logger';

const isConfigured = Boolean(env.LIVEKIT_URL && env.LIVEKIT_API_KEY && env.LIVEKIT_API_SECRET);

const roomService = new RoomServiceClient(
  env.LIVEKIT_URL ?? 'wss://localhost:7880',
  env.LIVEKIT_API_KEY ?? '',
  env.LIVEKIT_API_SECRET ?? '',
);

const egressClient = new EgressClient(
  env.LIVEKIT_URL ?? 'wss://localhost:7880',
  env.LIVEKIT_API_KEY ?? '',
  env.LIVEKIT_API_SECRET ?? '',
);

const assertConfigured = () => {
  if (!isConfigured) {
    logger.error('LiveKit is not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY and LIVEKIT_API_SECRET.');
    throw new ApiError(503, 'LiveKit is not configured on the server yet.');
  }
};

export const createLiveKitToken = async (params: {
  identity: string;
  name: string;
  roomName: string;
  canPublish: boolean;
  canSubscribe: boolean;
  roomAdmin: boolean;
}) => {
  assertConfigured();
  const token = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
    identity: params.identity,
    name: params.name,
    ttl: '6h',
  });
  token.addGrant({
    roomJoin: true,
    room: params.roomName,
    canPublish: params.canPublish,
    canSubscribe: params.canSubscribe,
    canPublishData: true,
    roomAdmin: params.roomAdmin,
  });
  return token.toJwt();
};

const ensureRoom = async (roomName: string, maxParticipants: number) => {
  assertConfigured();
  try {
    await roomService.createRoom({ name: roomName, maxParticipants });
    logger.info({ roomName }, 'LiveKit room created');
  } catch (error) {
    logger.warn({ roomName, error }, 'LiveKit room already exists or could not be created');
  }
};

export const livekit = {
  configured: isConfigured,
  roomService,
  egressClient,
  assertConfigured,
  ensureRoom,
};
