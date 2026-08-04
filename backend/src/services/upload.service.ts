import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { env } from '../config/env';
import { s3 } from '../config/s3';
import { ApiError } from '../utils/ApiError';
import { extFromMime } from '../utils/file';

const requireBucket = (): string => {
  if (!env.AWS_BUCKET_NAME) {
    throw new ApiError(500, 'AWS S3 bucket is not configured.');
  }
  return env.AWS_BUCKET_NAME;
};

export const generateUploadUrl = async (fileType: string, folder: string) => {
  const bucket = requireBucket();
  const ext = extFromMime(fileType);
  const key = `${folder}/${randomUUID()}${ext}`;

  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: fileType }),
    { expiresIn: 3600 },
  );

  return { url, key };
};

export const generateStreamUrl = async (key: string) => {
  const bucket = requireBucket();
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 3600 },
  );
};

export const resolveObjectUrl = async (value: string | null | undefined) => {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  return generateStreamUrl(value);
};

export const deleteObject = async (key: string) => {
  const bucket = requireBucket();
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
};
