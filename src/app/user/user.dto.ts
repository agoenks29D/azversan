import { PartialType, PickType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { IsEqualTo } from '@/core/framework/decorators';
import { UserGender } from './user.type';
import { listOfUserGender } from './user.constant';

export class UserDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @Length(3, 20)
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsIn(listOfUserGender)
  @IsOptional()
  gender: UserGender;

  @IsString()
  @Length(3, 30)
  @IsNotEmpty()
  full_name: string;
}

export class CreateUserDto extends UserDto {
  @IsBoolean()
  @IsNotEmpty()
  is_admin: boolean;
}

export class UpdateUserDto extends PartialType(UserDto) {}

export class UpdateProfileDto extends PartialType(
  PickType(UserDto, ['full_name']),
) {}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  old_password: string;

  @IsString()
  @IsNotEmpty()
  new_password: string;

  @IsString()
  @IsEqualTo('new_password')
  @IsNotEmpty()
  repeat_new_password: string;
}

export class BatchUserDto {
  @IsInt({ each: true })
  @IsNotEmpty()
  userIds: number[];
}
