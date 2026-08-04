import { Request } from 'express';

export const paramString = (req: Request, name: string): string => {
  const value = req.params[name];
  return typeof value === 'string' ? value : '';
};
