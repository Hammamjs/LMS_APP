import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PrismaModule } from './core/database/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './module/users/user.module';
import { AuthModule } from './module/auth/auth.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { CourseModule } from './module/courses/course.module';
import { LessonModule } from './module/lessons/lessons.module';
import { PaymentModule } from './module/payment/payment.module';
import { EnrollmentModule } from './module/enrollment/enrollment.module';
import { NotificationModule } from './module/notification/notification.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs';
import { json } from 'express';
import { LoggerModule } from './core/logger/logger.module';
import { ReviewModule } from './module/reviews/review.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const url = configService.getOrThrow<string>('REDIS_URL');
        const isTls = url.startsWith('rediss://');

        return {
          type: 'single',
          url,
          options: isTls
            ? {
                tls: {
                  rejectUnauthorized: false,
                },
              }
            : {},
        };
      },
      inject: [ConfigService],
    }),
    CqrsModule.forRoot({}),
    PrismaModule,
    UserModule,
    AuthModule,
    CourseModule,
    LessonModule,
    PaymentModule,
    EnrollmentModule,
    NotificationModule,
    ReviewModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(json())
      .exclude({
        path: 'api/webhook',
        method: RequestMethod.POST,
      })
      .forRoutes('*');
  }
}
