import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ResultInterceptor, DomainExceptionFilter } from '@/core';
import { corsOption } from './core/common/infrastructure/config/cors-option';
import { setDefaultResultOrder } from 'dns';

async function bootstrap() {
  setDefaultResultOrder('ipv4first');

  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.use(cookieParser());

  app.enableCors(corsOption);

  app.useGlobalInterceptors(new ResultInterceptor());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new DomainExceptionFilter());

  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port: ${port}`);
}
void bootstrap();
