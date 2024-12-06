import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { StorageModule } from '@/core/storage/storage.module';
import { AuthTokenModel } from '@/app/auth/models';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserModel } from './models';
import userConfig from './user.config';

@Module({
  imports: [
    ConfigModule.forFeature(userConfig),
    SequelizeModule.forFeature([AuthTokenModel, UserModel]),
    StorageModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
