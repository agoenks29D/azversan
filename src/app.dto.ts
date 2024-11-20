import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { BlackListType } from './core/security/blacklist/blacklist.type';

const blackListTypes: BlackListType[] = ['DeviceID', 'IP'];

export class CreateJwtDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;
}

export class CreateAPIKeyDto {
  @IsString()
  @IsNotEmpty()
  label: string;
}

export class AddBlacklistItemDto {
  @IsIn(blackListTypes)
  @IsNotEmpty()
  type: BlackListType;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class RemoveBlacklistItemDto extends PartialType(AddBlacklistItemDto) {}
