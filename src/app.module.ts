import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/database/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModules } from './module/users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
