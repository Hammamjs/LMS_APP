import { Module, Provider } from '@nestjs/common';
import { GetUserNotificationUseCase } from './application/usecases/get-user-notification/get-user-notification.usecase';
import { GetUserNotificationsUseCase } from './application/usecases/get-user-notifications/get-user-notification.usecase';
import { DeleteNotificationUsecase } from './application/usecases/delete-notification/delete-notification.usecase';
import { DeleteMultipleNotificationUseCase } from './application/usecases/delete-multiple-notifications/delete-multiple-notifications.usecase';
import { UpdateNotificationUseCase } from './application/usecases/update-notification/update-notification.usecase';
import { UpdateNotificationsUseCase } from './application/usecases/update-notifications/update-notifications.usecase';
import { NotificationFacade } from './application/usecases/notification.facade';
import { NotificationPrismaRepository } from './infrastructure/notification.prisma.repository';
import { INOTIFICATION_REPOSITORY } from './domain/constant/injection.token';
import { NotificationController } from './presentation/notification.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

const usecases: Provider[] = [
  GetUserNotificationUseCase,
  GetUserNotificationsUseCase,
  DeleteNotificationUsecase,
  DeleteMultipleNotificationUseCase,
  UpdateNotificationUseCase,
  UpdateNotificationsUseCase,
  NotificationFacade,
];

const infrastructure: Provider[] = [
  NotificationPrismaRepository,
  {
    provide: INOTIFICATION_REPOSITORY,
    useClass: NotificationPrismaRepository,
  },
];

@Module({
  exports: [],
  imports: [JwtModule, ConfigModule],
  controllers: [NotificationController],
  providers: [...usecases, ...infrastructure],
})
export class NotificationModule {}
