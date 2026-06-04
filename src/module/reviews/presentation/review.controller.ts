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
    const { limit, page } = query;
    return await this.reviewFacade.findByCourse.execute({
      courseId,
      limit,
      page,
    });
  }

  @Post(':courseId/reviews')
  @UseGuards(VerifyJwt)
  async create(
    @Param('courseId') courseId: string,
    @Req() req: { user: JwtPayload },
    @Body() dto: CreateReviewDto,
  ) {
    const { content, rating } = dto;
    const { id: userId } = req.user;
    return await this.reviewFacade.create.execute({
      courseId,
      userId,
      content,
      rating,
    });
  }

  @Patch(':courseId/reviews')
  @UseGuards(VerifyJwt)
  async update(
    @Param('courseId') courseId: string,
    @Req() req: { user: JwtPayload },
    @Body() dto: UpdateReviewDto,
  ) {
    const { id: userId } = req.user;
    const { content, rating } = dto;
    return await this.reviewFacade.update.execute({
      userId,
      courseId,
      content,
      rating,
    });
  }

  @Delete(':courseId/reviews')
  @UseGuards(VerifyJwt)
  async delete(
    @Param('courseId') courseId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const { id: userId } = req.user;
    return await this.reviewFacade.deleteReview.execute({ userId, courseId });
  }
}
