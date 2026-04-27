import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class NotificationIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true }) // uuid- version 4
  ids!: string[];
}
