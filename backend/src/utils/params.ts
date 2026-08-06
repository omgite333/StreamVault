import { Request } from 'express';

export const paramString = (req: Request, name: string): string => {
  const value = req.params[name];
  return typeof value === 'string' ? value : '';
};

export const queryString = (req: Request, name: string): string | undefined => {
  const value = req.query[name];
  return typeof value === 'string' ? value : undefined;
};
