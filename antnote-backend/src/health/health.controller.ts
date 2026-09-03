import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import type { DataSource } from 'typeorm';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * Liveness/readiness probe for load balancers (AWS ALB/ECS) and local
   * docker-compose healthchecks. Verifies the app can actually reach
   * PostgreSQL, not just that the process is up.
   */
  @Get()
  async check() {
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException('Database connection failed');
    }

    return {
      status: 'ok',
      database: 'up',
      timestamp: new Date().toISOString(),
    };
  }
}
