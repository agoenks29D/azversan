import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class APIKeyDto {
  @IsString()
  @Length(1, 255)
  @IsOptional()
  key: string;

  @IsString()
  @Length(1, 255)
  @IsNotEmpty()
  label: string;

  @IsString()
  @Length(0, 255)
  @IsOptional()
  description: string;
}

export class UpdateAPIKeyDto extends PartialType(APIKeyDto) {}
