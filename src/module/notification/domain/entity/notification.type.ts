import { PaginationParams } from '@/core';

export interface NotificationState {
  readonly id: string;
  readonly title: string;
  readonly text: string;
  readonly read: boolean;
  readonly createdAt: Date;
  readonly userId: string;
  readonly isDeleted: boolean;
}

export interface NotificationPaginationResult extends PaginationParams {
  readonly userId: string;
}
