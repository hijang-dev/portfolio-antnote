const REQUIRED_ENV_VARS = [
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'REDIS_HOST',
  'REDIS_PORT',
  'SESSION_SECRET',
] as const;

/**
 * Fails fast on boot if a required env var is missing, instead of
 * surfacing a confusing connection error later.
 */
export function validateEnv(config: Record<string, unknown>) {
  const missing = REQUIRED_ENV_VARS.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. See .env.example.`,
    );
  }

  return config;
}
