import type { ConfigService } from '@nestjs/config';
import { RedisStore } from 'connect-redis';
import type { RequestHandler } from 'express';
import session, { type SessionOptions } from 'express-session';
import { createClient } from 'redis';
import type { AppConfig } from '../../config/configuration.js';

/**
 * Session data lives in Redis, not in-process — so restarting/scaling the
 * API doesn't log everyone out, and no user data sits in a JWT payload
 * that a client could decode.
 */
export async function createSessionMiddleware(
  config: ConfigService<AppConfig, true>,
): Promise<RequestHandler> {
  const isProd = config.get('nodeEnv', { infer: true }) === 'production';

  const redisClient = createClient({
    socket: {
      host: config.get('redis.host', { infer: true }),
      port: config.get('redis.port', { infer: true }),
    },
  });
  redisClient.on('error', (err) => {
    console.error('Redis client error:', err);
  });
  await redisClient.connect();

  const store = new RedisStore({
    client: redisClient,
    prefix: 'antnote:sess:',
  });

  const secret = config.get('session.secret', { infer: true });
  if (!secret) {
    // Unreachable in practice — env.validation.ts requires SESSION_SECRET at boot.
    throw new Error('SESSION_SECRET is not set');
  }

  const options: SessionOptions = {
    store,
    name: 'antnote.sid',
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: config.get('session.maxAgeMs', { infer: true }),
    },
  };

  return session(options);
}
