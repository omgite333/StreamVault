import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { paramString, queryString } from '../utils/params';
import * as meetingService from '../services/meeting.service';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const meeting = await meetingService.create(req.user!.id, req.body);
  res.status(201).json({ success: true, message: 'Meeting created.', data: meeting });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const filter = (queryString(req, 'filter') || 'all') as 'upcoming' | 'live' | 'past' | 'all';
  const meetings = await meetingService.list(filter);
  res.json({ success: true, message: 'Meetings fetched.', data: meetings });
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  const meeting = await meetingService.get(paramString(req, 'id'));
  res.json({ success: true, message: 'Meeting fetched.', data: meeting });
});

export const start = asyncHandler(async (req: Request, res: Response) => {
  const meeting = await meetingService.start(req.user!.id, paramString(req, 'id'));
  res.json({ success: true, message: 'Meeting started.', data: meeting });
});

export const end = asyncHandler(async (req: Request, res: Response) => {
  const meeting = await meetingService.end(req.user!.id, paramString(req, 'id'));
  res.json({ success: true, message: 'Meeting ended.', data: meeting });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await meetingService.remove(req.user!.id, req.user!.role, paramString(req, 'id'));
  res.json({ success: true, message: 'Meeting deleted.', data: null });
});

export const join = asyncHandler(async (req: Request, res: Response) => {
  const data = await meetingService.joinToken(req.user!.id, paramString(req, 'id'));
  res.json({ success: true, message: 'Join token generated.', data });
});

export const joinByCode = asyncHandler(async (req: Request, res: Response) => {
  const data = await meetingService.joinByCode(req.body);
  res.json({ success: true, message: 'Join token generated.', data });
});

export const leave = asyncHandler(async (req: Request, res: Response) => {
  const data = await meetingService.leave(req.user!.id, paramString(req, 'id'), req.body ?? {});
  res.json({ success: true, message: 'Left meeting.', data });
});

export const kick = asyncHandler(async (req: Request, res: Response) => {
  const data = await meetingService.kickParticipant(req.user!.id, paramString(req, 'id'), paramString(req, 'identity'));
  res.json({ success: true, message: 'Participant removed.', data });
});

export const listChat = asyncHandler(async (req: Request, res: Response) => {
  const messages = await meetingService.listChat(paramString(req, 'id'));
  res.json({ success: true, message: 'Chat messages fetched.', data: messages });
});

export const sendChat = asyncHandler(async (req: Request, res: Response) => {
  const message = await meetingService.sendChat(req.user!.id, paramString(req, 'id'), req.body);
  res.status(201).json({ success: true, message: 'Message sent.', data: message });
});

export const startRecording = asyncHandler(async (req: Request, res: Response) => {
  const data = await meetingService.startRecording(req.user!.id, paramString(req, 'id'));
  res.json({ success: true, message: 'Recording started.', data });
});

export const stopRecording = asyncHandler(async (req: Request, res: Response) => {
  const data = await meetingService.stopRecording(req.user!.id, paramString(req, 'id'));
  res.json({ success: true, message: 'Recording stopped.', data });
});
