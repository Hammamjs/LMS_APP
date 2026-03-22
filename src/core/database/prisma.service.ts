import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    super({ adapter });
  }
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
