import { PartialType } from '@nestjs/mapped-types';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { BlackListType } from './blacklist.type';
import { blacklistTypes } from './blacklist.constant';

export class BlacklistDto {
  @IsNotEmpty()
  @IsIn(blacklistTypes)
  type: BlackListType;

  @IsString()
  @Length(1, 255)
  @IsNotEmpty()
  value: string;

  @IsString()
  @Length(0, 255)
  @IsOptional()
  description: string;
}

export class UpdateBlacklistDto extends PartialType(BlacklistDto) {}
