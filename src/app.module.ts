import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/database/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './module/users/user.module';
import { AuthModule } from './module/auth/auth.module';
import { RedisModule } from '@nestjs-modules/ioredis';
<<<<<<< Updated upstream
=======
import { CourseModule } from './module/courses/course.module';
import { LessonModule } from './module/lessons/lessons.module';
import { PaymentModule } from './module/payment/payment.module';
import { EnrollmentModule } from './module/enrollment/enrollment.module';
import { NotificationModule } from './module/notification/notification.module';
import { ThrottlerModule } from '@nestjs/throttler';
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: `redis://${configService.get('REDIS_HOST', 'redis-server')}:6379`,
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    UserModule,
    AuthModule,
<<<<<<< Updated upstream
=======
    CourseModule,
    LessonModule,
    PaymentModule,
    EnrollmentModule,
    NotificationModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
