import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { AllConfigType } from '@/app.type';
import { UserConfig } from './user.type';
import { UserModel } from './models';

@Injectable()
export class UserService {
  constructor(
    private configService: ConfigService<AllConfigType>,
    @InjectModel(UserModel) private userModel: typeof UserModel,
  ) {}

  encryptPassword(password: string) {
    const { saltRounds } = this.configService.get<UserConfig>('user');
    const salt = genSaltSync(saltRounds);
    return hashSync(password, salt);
  }

  comparePassword(password: string, hash: string): boolean {
    return compareSync(password, hash);
  }

  async isEmailRegistered(email: string, userId?: number) {
    const isRegistered = await this.userModel.findOne({ where: { email } });

    if (userId) {
      return isRegistered.id !== userId;
    }

    return isRegistered !== null;
  }

  async isUsernameRegistered(username: string, userId?: number) {
    const isRegistered = await this.userModel.findOne({ where: { username } });

    if (userId) {
      return isRegistered.id !== userId;
    }

    return isRegistered !== null;
  }
}
