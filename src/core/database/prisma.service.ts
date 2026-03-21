import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client/index.js';
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Prisma Connected successfully');
    } catch (err) {
      console.log('Failed to connect to prisma ', err);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
