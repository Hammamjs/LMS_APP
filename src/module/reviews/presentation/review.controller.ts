import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewFacade } from '../application/review.facade';
import { FindReviewParams } from './dto/find-reviews.dto';
import { CreateReviewDto } from './dto/create.review.dto';
import { UpdateReviewDto } from './dto/update.review.dto';
import { VerifyJwt } from '@/core';
import { JwtPayload } from '@/module/auth';

@Controller('courses')
export class ReviewController {
  constructor(private readonly reviewFacade: ReviewFacade) {}

  @Get(':courseId/reviews')
  async findByCourse(
    @Param('courseId') courseId: string,
    @Query() query: FindReviewParams,
  ) {
    return await this.reviewFacade.findByCourse.execute({
      courseId,
      ...query,
    });
  }

  @Post(':courseId/reviews')
  @UseGuards(VerifyJwt)
  async create(
    @Param('courseId') courseId: string,
    @Req() req: Request,
    @Body() dto: CreateReviewDto,
  ) {
    const { id: userId } = req['user'] as JwtPayload;
    return await this.reviewFacade.create.execute({ courseId, userId, ...dto });
  }

  @Patch(':courseId/reviews')
  @UseGuards(VerifyJwt)
  async update(
    @Param('courseId') courseId: string,
    @Req() req: Request,
    @Body() dto: UpdateReviewDto,
  ) {
    const { id: userId } = req['user'] as JwtPayload;
    return await this.reviewFacade.update.execute({ userId, courseId, ...dto });
  }

  @Delete(':courseId/reviews')
  @UseGuards(VerifyJwt)
  async delete(@Param('courseId') courseId: string, @Req() req: Request) {
    const { id: userId } = req['user'] as JwtPayload;
    return await this.reviewFacade.deleteReview.execute({ userId, courseId });
  }
}
