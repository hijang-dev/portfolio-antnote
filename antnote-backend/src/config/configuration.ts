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
  jwt: {
    secret?: string;
    expiresIn: string;
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
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },
});

export default configuration;
