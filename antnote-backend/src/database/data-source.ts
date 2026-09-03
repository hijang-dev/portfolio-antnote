import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

/**
 * Standalone DataSource used only by the TypeORM CLI (migration:generate /
 * migration:run / migration:revert). The running app gets its connection
 * from TypeOrmModule.forRootAsync in app.module.ts instead.
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
