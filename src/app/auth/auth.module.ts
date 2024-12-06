import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from '@/app/user/models';
import { UserService } from '@/app/user/user.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthTokenModel, AuthVerifyModel } from './models';

@Module({
  imports: [
    SequelizeModule.forFeature([AuthTokenModel, AuthVerifyModel, UserModel]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService],
})
export class AuthModule {}
