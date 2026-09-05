import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { createSessionMiddleware } from './common/session/create-session-middleware.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import type { AppConfig } from './config/configuration.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<AppConfig, true>);

  app.use(helmet());
  app.enableCors({
    origin: config.get('corsOrigin', { infer: true }),
    credentials: true, // required for the session cookie to travel cross-origin
  });
  app.use(await createSessionMiddleware(config));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('antnote API')
    .setDescription('API for antnote, a beginner-friendly stock investing app')
    .setVersion('0.1')
    .addCookieAuth('antnote.sid')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get('port', { infer: true });
  await app.listen(port);
}
await bootstrap();
