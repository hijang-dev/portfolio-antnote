import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { AppConfig } from '../config/configuration.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const isProd = config.get('nodeEnv', { infer: true }) === 'production';

        return {
          type: 'postgres',
          host: config.get('database.host', { infer: true }),
          port: config.get('database.port', { infer: true }),
          username: config.get('database.username', { infer: true }),
          password: config.get('database.password', { infer: true }),
          database: config.get('database.name', { infer: true }),
          entities: ['dist/**/*.entity.js'],
          migrations: ['dist/database/migrations/*.js'],
          // Schema is managed through migrations, never auto-synced.
          synchronize: false,
          migrationsRun: isProd,
          logging: !isProd,
          retryAttempts: 5,
          retryDelay: 3000,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
