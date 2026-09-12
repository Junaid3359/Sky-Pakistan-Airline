import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app, start } from '../src/index';

let ready: Promise<void> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!ready) ready = start().then(() => undefined);
  await ready;
  return app(req, res);
}