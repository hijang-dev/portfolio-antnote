export interface AppConfig {
  nodeEnv: string;
  port: number;
  corsOrigin: string;
  database: {
    host?: string;
    port: number;
    username?: string;
    password?: string;
    name?: string;
  };
  redis: {
    host?: string;
    port: number;
  };
  session: {
    secret?: string;
    maxAgeMs: number;
  };
}

const configuration = (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3001',
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  session: {
    secret: process.env.SESSION_SECRET,
    maxAgeMs: parseInt(process.env.SESSION_MAX_AGE_MS ?? '86400000', 10), // 1 day
  },
});

export default configuration;
