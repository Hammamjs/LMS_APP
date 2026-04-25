import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DomainExceptionFilter } from './core/common/filters/domain.exception.filter';
import cookieParser from 'cookie-parser';
<<<<<<< Updated upstream
=======
import { ResultInterceptor, DomainExceptionFilter } from './core';
import { corsOption } from './core/common/infrastructure/config/cors-option';
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(corsOption);

  app.enableCors(corsOption);

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
