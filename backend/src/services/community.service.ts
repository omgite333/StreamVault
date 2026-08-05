import { ApiError } from '../utils/ApiError';
import { resolveObjectUrl } from './upload.service';
import * as communityRepo from '../repositories/community.repository';
import * as appSettingRepo from '../repositories/app-setting.repository';
import type { CreateMessageInput } from '../validations/community.validation';

const COMMUNITY_ENABLED_KEY = 'community_enabled';

type CommunityMessage = Awaited<ReturnType<typeof communityRepo.findAllMessages>>[number];

const withAuthorAvatar = async (message: CommunityMessage) => ({
  ...message,
  author: {
    ...message.author,
    profileImageUrl: await resolveObjectUrl(message.author.profileImage),
  },
});

export const isEnabled = async () => {
  const setting = await appSettingRepo.getSetting(COMMUNITY_ENABLED_KEY);
  return setting ? setting.value === 'true' : true;
};

export const setEnabled = async (enabled: boolean) => {
  await appSettingRepo.upsertSetting(COMMUNITY_ENABLED_KEY, String(enabled));
  return { enabled };
};

export const list = async () => {
  const messages = await communityRepo.findAllMessages();
  return Promise.all(messages.map(withAuthorAvatar));
};

export const create = async (userId: string, input: CreateMessageInput) => {
  if (!(await isEnabled())) {
    throw new ApiError(403, 'The community is currently disabled by an administrator.');
  }

  if (input.parentId) {
    const parent = await communityRepo.findMessageById(input.parentId);
    if (!parent) {
      throw new ApiError(404, 'The message you are replying to no longer exists.');
    }
  }

  const message = await communityRepo.createMessage({
    content: input.content,
    parentId: input.parentId ?? null,
    authorId: userId,
  });

  return withAuthorAvatar(message);
};

export const remove = async (userId: string, role: string, id: string) => {
  const message = await communityRepo.findMessageById(id);
  if (!message) {
    throw new ApiError(404, 'Message not found.');
  }

  if (message.authorId !== userId && role !== 'ADMIN') {
    throw new ApiError(403, 'You can only delete your own messages.');
  }

  await communityRepo.deleteMessage(id);
};

export const removeAsAdmin = async (id: string) => {
  const message = await communityRepo.findMessageById(id);
  if (!message) {
    throw new ApiError(404, 'Message not found.');
  }

  await communityRepo.deleteMessage(id);
};
