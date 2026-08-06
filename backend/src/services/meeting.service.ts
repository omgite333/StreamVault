import { randomBytes, randomUUID } from 'crypto';
import { EncodedFileOutput, S3Upload } from '@livekit/protocol';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { createLiveKitToken, livekit } from '../config/livekit';
import * as meetingRepo from '../repositories/meeting.repository';
import * as userRepo from '../repositories/user.repository';
import { slugify } from '../utils/slug';
import type {
  AttendanceInput,
  CreateMeetingInput,
  JoinByCodeInput,
  MeetingChatInput,
} from '../validations/meeting.validation';
import type { MeetingRole } from '@prisma/client';

const GENERATE_RETRIES = 5;

const generateJoinCode = async () => {
  for (let i = 0; i < GENERATE_RETRIES; i++) {
    const code = randomBytes(3).toString('hex').toUpperCase().slice(0, 6);
    const existing = await meetingRepo.findMeetingByJoinCode(code);
    if (!existing) return code;
  }
  throw new ApiError(500, 'Could not generate a unique meeting code. Please try again.');
};

const generateRoomName = (title: string) => {
  const base = slugify(title) || 'meeting';
  return `${base}-${randomUUID().slice(0, 8)}`;
};

export const create = async (userId: string, input: CreateMeetingInput) => {
  const joinCode = await generateJoinCode();
  const roomName = generateRoomName(input.title);
  const scheduledAt = input.scheduledAt ?? new Date();
  const host = await userRepo.findUserById(userId);

  const meeting = await meetingRepo.createMeeting({
    title: input.title,
    description: input.description,
    hostId: userId,
    roomName,
    joinCode,
    scheduledAt,
    maxParticipants: input.maxParticipants ?? 50,
  });

  await meetingRepo.upsertParticipant({
    meetingId: meeting.id,
    userId,
    name: host?.name ?? 'Host',
    role: 'HOST',
  });

  logger.info({ meetingId: meeting.id, hostId: userId, joinCode }, 'Meeting created');
  return meeting;
};

export const list = (filter: 'upcoming' | 'live' | 'past' | 'all' = 'all') => meetingRepo.findAllMeetings(filter);

export const get = async (id: string) => {
  const meeting = await meetingRepo.findMeetingById(id);
  if (!meeting) {
    throw new ApiError(404, 'Meeting not found.');
  }
  return meeting;
};

export const start = async (userId: string, id: string) => {
  const meeting = await get(id);
  if (meeting.hostId !== userId) {
    throw new ApiError(403, 'Only the host can start this meeting.');
  }
  if (meeting.status === 'ENDED') {
    throw new ApiError(409, 'This meeting has already ended.');
  }
  const host = await userRepo.findUserById(userId);
  await livekit.ensureRoom(meeting.roomName, meeting.maxParticipants);
  await meetingRepo.upsertParticipant({
    meetingId: meeting.id,
    userId,
    name: host?.name ?? 'Host',
    role: 'HOST',
  });
  const updated = await meetingRepo.updateMeeting(id, { status: 'LIVE', startedAt: new Date() });
  logger.info({ meetingId: id, userId }, 'Meeting started');
  return updated;
};

export const end = async (userId: string, id: string) => {
  const meeting = await get(id);
  if (meeting.hostId !== userId) {
    throw new ApiError(403, 'Only the host can end this meeting.');
  }
  if (meeting.status === 'ENDED') {
    throw new ApiError(409, 'This meeting has already ended.');
  }
  await meetingRepo.updateMeeting(id, { status: 'ENDED', endedAt: new Date() });
  await meetingRepo.markAllParticipantsLeft(id);
  logger.info({ meetingId: id, userId }, 'Meeting ended');
  return meetingRepo.findMeetingById(id);
};

export const remove = async (userId: string, role: string, id: string) => {
  const meeting = await get(id);
  if (meeting.hostId !== userId && role !== 'ADMIN') {
    throw new ApiError(403, 'Only the host or an administrator can delete this meeting.');
  }
  await meetingRepo.deleteMeeting(id);
  logger.info({ meetingId: id, userId, asAdmin: role === 'ADMIN' }, 'Meeting deleted');
};

export const joinToken = async (userId: string, id: string) => {
  const meeting = await get(id);
  if (meeting.status === 'ENDED') {
    throw new ApiError(409, 'This meeting has already ended.');
  }

  await livekit.ensureRoom(meeting.roomName, meeting.maxParticipants);

  const role: MeetingRole = meeting.hostId === userId ? 'HOST' : 'STUDENT';
  const user = await userRepo.findUserById(userId);
  const participant = await meetingRepo.upsertParticipant({
    meetingId: meeting.id,
    userId,
    name: user?.name ?? 'Student',
    role,
  });

  if (meeting.status === 'SCHEDULED') {
    await meetingRepo.updateMeeting(id, { status: 'LIVE', startedAt: new Date() });
  }

  const token = await createLiveKitToken({
    identity: participant.id,
    name: participant.name,
    roomName: meeting.roomName,
    canPublish: true,
    canSubscribe: true,
    roomAdmin: role === 'HOST',
  });

  return { token, roomName: meeting.roomName, role, meeting: await meetingRepo.findMeetingById(id) };
};

export const joinByCode = async (input: JoinByCodeInput) => {
  const meeting = await meetingRepo.findMeetingByJoinCode(input.joinCode);
  if (!meeting) {
    throw new ApiError(404, 'No meeting found for that code.');
  }
  if (meeting.status === 'ENDED') {
    throw new ApiError(409, 'This meeting has already ended.');
  }

  await livekit.ensureRoom(meeting.roomName, meeting.maxParticipants);

  const participant = await meetingRepo.upsertParticipant({
    meetingId: meeting.id,
    userId: null,
    name: input.name,
    role: 'GUEST',
  });

  if (meeting.status === 'SCHEDULED') {
    await meetingRepo.updateMeeting(meeting.id, { status: 'LIVE', startedAt: new Date() });
  }

  const token = await createLiveKitToken({
    identity: participant.id,
    name: input.name,
    roomName: meeting.roomName,
    canPublish: false,
    canSubscribe: true,
    roomAdmin: false,
  });

  return { token, roomName: meeting.roomName, role: 'GUEST' as const, meeting };
};

export const leave = async (userId: string, id: string, input: AttendanceInput) => {
  const participant = await meetingRepo.findParticipant(id, userId);
  if (!participant) {
    return null;
  }
  await meetingRepo.markParticipantLeft(participant.id, new Date());
  await meetingRepo.upsertAttendance({
    meetingId: id,
    participantId: participant.id,
    duration: input.duration ?? 0,
    cameraOnTime: input.cameraOnTime ?? 0,
    micOnTime: input.micOnTime ?? 0,
  });
  logger.info({ meetingId: id, userId, duration: input.duration }, 'Participant left meeting');
  return { leftAt: new Date() };
};

export const kickParticipant = async (userId: string, id: string, identity: string) => {
  const meeting = await get(id);
  if (meeting.hostId !== userId) {
    throw new ApiError(403, 'Only the host can remove participants.');
  }
  livekit.assertConfigured();
  await livekit.roomService.removeParticipant(meeting.roomName, identity);
  logger.info({ meetingId: id, userId, identity }, 'Participant removed by host');
  return { removed: identity };
};

export const listChat = async (id: string) => {
  await get(id);
  return meetingRepo.findAllChatMessages(id);
};

const activeEgress = new Map<string, { egressId: string; filepath: string }>();

const recordingS3Bucket = () => env.LIVEKIT_EGRESS_S3_BUCKET || env.AWS_BUCKET_NAME;

export const startRecording = async (userId: string, id: string) => {
  const meeting = await get(id);
  if (meeting.hostId !== userId) {
    throw new ApiError(403, 'Only the host can start a recording.');
  }
  const bucket = recordingS3Bucket();
  if (!bucket) {
    throw new ApiError(400, 'Recording storage is not configured on the server yet.');
  }
  livekit.assertConfigured();
  const filepath = `recordings/${meeting.roomName}/${Date.now()}.mp4`;
  const egress = await livekit.egressClient.startRoomCompositeEgress(meeting.roomName, {
    file: new EncodedFileOutput({
      filepath,
      output: {
        case: 's3',
        value: new S3Upload({
          bucket,
          region: env.AWS_REGION,
          accessKey: env.AWS_ACCESS_KEY_ID ?? '',
          secret: env.AWS_SECRET_ACCESS_KEY ?? '',
        }),
      },
    }),
  });
  const egressId = egress.egressId ?? '';
  activeEgress.set(meeting.roomName, { egressId, filepath });
  logger.info({ meetingId: id, userId, egressId }, 'Recording started');
  return { egressId };
};

export const stopRecording = async (userId: string, id: string) => {
  const meeting = await get(id);
  if (meeting.hostId !== userId) {
    throw new ApiError(403, 'Only the host can stop the recording.');
  }
  const active = activeEgress.get(meeting.roomName);
  if (active) {
    await livekit.egressClient.stopEgress(active.egressId);
    const bucket = recordingS3Bucket();
    if (bucket) {
      const recordingUrl = `https://${bucket}.s3.${env.AWS_REGION}.amazonaws.com/${active.filepath}`;
      await meetingRepo.updateMeeting(id, { recordingUrl });
      logger.info({ meetingId: id, userId, recordingUrl }, 'Recording stopped and saved');
      activeEgress.delete(meeting.roomName);
      return { stopped: true, recordingUrl };
    }
    activeEgress.delete(meeting.roomName);
    return { stopped: true, recordingUrl: null };
  }
  return { stopped: false };
};

export const sendChat = async (userId: string, id: string, input: MeetingChatInput) => {
  await get(id);
  const participant = await meetingRepo.findParticipant(id, userId);
  const message = await meetingRepo.createChatMessage({
    meetingId: id,
    userId,
    name: participant?.name ?? 'Unknown',
    message: input.message,
  });
  logger.info({ meetingId: id, userId, messageId: message.id }, 'Meeting chat message sent');
  return message;
};
