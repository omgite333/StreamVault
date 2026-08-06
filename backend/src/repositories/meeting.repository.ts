import { prisma } from '../config/database';
import type { MeetingStatus } from '@prisma/client';

const hostSelect = {
  select: { id: true, name: true, profileImage: true },
};

export const findAllMeetings = (filter: 'upcoming' | 'live' | 'past' | 'all' = 'all') => {
  const now = new Date();
  const where =
    filter === 'upcoming'
      ? { status: 'SCHEDULED' as MeetingStatus, scheduledAt: { gte: now } }
      : filter === 'live'
        ? { status: 'LIVE' as MeetingStatus }
        : filter === 'past'
          ? { status: 'ENDED' as MeetingStatus }
          : {};

  return prisma.meeting.findMany({
    where,
    include: {
      host: hostSelect,
      _count: { select: { participants: true } },
    },
    orderBy: filter === 'past' ? { scheduledAt: 'desc' } : { scheduledAt: 'asc' },
  });
};

export const findMeetingById = (id: string) =>
  prisma.meeting.findUnique({
    where: { id },
    include: {
      host: hostSelect,
      participants: {
        orderBy: { joinedAt: 'asc' },
        select: {
          id: true,
          name: true,
          role: true,
          joinedAt: true,
          leftAt: true,
          userId: true,
          user: { select: { id: true, name: true, profileImage: true } },
        },
      },
      _count: { select: { participants: true, chatMessages: true } },
    },
  });

export const findMeetingByJoinCode = (joinCode: string) =>
  prisma.meeting.findUnique({
    where: { joinCode: joinCode.toUpperCase() },
    include: { host: hostSelect },
  });

export const createMeeting = (data: {
  title: string;
  description?: string;
  hostId: string;
  roomName: string;
  joinCode: string;
  scheduledAt: Date;
  maxParticipants: number;
}) =>
  prisma.meeting.create({
    data,
    include: { host: hostSelect, _count: { select: { participants: true } } },
  });

export const updateMeeting = (id: string, data: Partial<{ status: MeetingStatus; startedAt: Date; endedAt: Date; recordingUrl: string; thumbnail: string }>) =>
  prisma.meeting.update({ where: { id }, data });

export const deleteMeeting = (id: string) => prisma.meeting.delete({ where: { id } });

export const upsertParticipant = async (data: {
  meetingId: string;
  userId: string | null;
  name: string;
  role: 'HOST' | 'COHOST' | 'STUDENT' | 'GUEST';
}) => {
  if (!data.userId) {
    const existing = await prisma.meetingParticipant.findFirst({
      where: {
        meetingId: data.meetingId,
        userId: null,
        leftAt: null,
        name: { equals: data.name, mode: 'insensitive' },
      },
    });
    if (existing) {
      return prisma.meetingParticipant.update({
        where: { id: existing.id },
        data: { name: data.name, role: data.role, leftAt: null },
      });
    }
    return prisma.meetingParticipant.create({ data });
  }
  return prisma.meetingParticipant.upsert({
    where: { meetingId_userId: { meetingId: data.meetingId, userId: data.userId } },
    create: data,
    update: { name: data.name, role: data.role, leftAt: null },
  });
};

export const findParticipant = (meetingId: string, userId: string | null) =>
  prisma.meetingParticipant.findFirst({
    where: { meetingId, ...(userId ? { userId } : {}) },
    include: { attendance: true },
  });

export const markParticipantLeft = (id: string, leftAt: Date) =>
  prisma.meetingParticipant.update({ where: { id }, data: { leftAt } });

export const markAllParticipantsLeft = (meetingId: string) =>
  prisma.meetingParticipant.updateMany({ where: { meetingId, leftAt: null }, data: { leftAt: new Date() } });

export const upsertAttendance = (data: {
  meetingId: string;
  participantId: string;
  duration: number;
  cameraOnTime: number;
  micOnTime: number;
}) =>
  prisma.meetingAttendance.upsert({
    where: { meetingId_participantId: { meetingId: data.meetingId, participantId: data.participantId } },
    create: data,
    update: {
      duration: data.duration,
      cameraOnTime: data.cameraOnTime,
      micOnTime: data.micOnTime,
    },
  });

export const findAllChatMessages = (meetingId: string) =>
  prisma.meetingChatMessage.findMany({
    where: { meetingId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      meetingId: true,
      userId: true,
      name: true,
      message: true,
      createdAt: true,
      user: { select: { id: true, name: true, profileImage: true } },
    },
  });

export const createChatMessage = (data: { meetingId: string; userId: string | null; name: string; message: string }) =>
  prisma.meetingChatMessage.create({ data });
