import { User } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  isArray,
} from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  groupName: string;

  @IsNotEmpty()
  @IsBoolean()
  simplify: boolean;

  @IsOptional()
  @IsArray()
  userIds?: number[];
}
