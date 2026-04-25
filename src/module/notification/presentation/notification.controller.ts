import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationFacade } from '../application/usecases/notification.facade';
import { VerifyJwt } from '@/core';
import { JwtPayload } from '@/module/auth';
import { QueryPaginationNotification } from './dto/pagination.notification.dto';
import { NotificationIdDto } from './dto/notification.id.dto';
import { NotificationIdsDto } from './dto/notification.ids.dto';

@UseGuards(VerifyJwt)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationFacade: NotificationFacade) {}

  @Get()
  async findAll(
    @Req() request: Request,
    @Query() query: QueryPaginationNotification,
  ) {
    const { id: userId } = request['user'] as JwtPayload;

    return await this.notificationFacade.getNotifications.execute({
      ...query,
      userId,
    });
  }

  @Get(':id')
  async findOne(@Param() dto: NotificationIdDto) {
    return await this.notificationFacade.getNotification.execute(dto.id);
  }

  @Patch('update')
  async updateOne(@Body() dto: NotificationIdDto) {
    return await this.notificationFacade.updateNotification.execute(dto.id);
  }

  @Patch('update-all')
  async updateAll(@Req() request: Request) {
    const { id: userId } = request['user'] as JwtPayload;
    return await this.notificationFacade.updateNotifications.execute(userId);
  }

  @Delete('delete')
  async delete(@Query() dto: NotificationIdDto) {
    return await this.notificationFacade.deleteOne.execute(dto.id);
  }

  @Delete('delete-many')
  async deleteMany(@Body() dto: NotificationIdsDto) {
    return await this.notificationFacade.deleteAll.execute(dto.ids);
  }
}
