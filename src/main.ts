import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ResultInterceptor, DomainExceptionFilter } from '@/core';
import { corsOption } from './core/common/infrastructure/config/cors-option';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(corsOption);

  app.useGlobalInterceptors(new ResultInterceptor());

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new DomainExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
