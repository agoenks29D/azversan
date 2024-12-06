import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { UserDto } from '@/app/user/user.dto';
import { IsEqualTo } from '@/core/framework/decorators';

export class SignUpDto extends UserDto {}

export class SignInDto {
  @IsString()
  @IsNotEmpty()
  identity: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  identity: string;

  @IsIn(['email', 'sms'])
  @IsOptional()
  recovery_method: 'email' | 'sms';
}

export class ResetPasswordDto {
  @ValidateIf((o: ResetPasswordDto) => !o.token)
  @IsString()
  @IsNotEmpty()
  code: string;

  @ValidateIf((o: ResetPasswordDto) => !o.code)
  @IsString()
  @IsNotEmpty()
  token: string;

  @ValidateIf((o: ResetPasswordDto) => !o.code)
  @IsString()
  @IsNotEmpty()
  new_password: string;

  @ValidateIf((o: ResetPasswordDto) => !o.code)
  @IsString()
  @IsEqualTo('new_password')
  @IsNotEmpty()
  repeat_new_password: string;
}
