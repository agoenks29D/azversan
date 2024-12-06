import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  SerializeOptions,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FileInterceptor } from '@nestjs/platform-express';
import { FindAndCountOptions, Op } from 'sequelize';
import { instanceToPlain } from 'class-transformer';
import sharp from 'sharp';
import { StorageService } from '@/core/storage/storage.service';
import { LimitQuery, OffsetQuery, Trashed } from '@/core/framework/decorators';
import { ErrorFormat } from '@/app.type';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { AuthenticatedUser } from './user.decorator';
import { UserAttributes, UserModel } from './models';
import {
  BatchUserDto,
  ChangePasswordDto,
  CreateUserDto,
  UpdateProfileDto,
} from './user.dto';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(
    private userService: UserService,
    private storageService: StorageService,
    @InjectModel(UserModel) private userModel: typeof UserModel,
  ) {}

  @Post()
  @SerializeOptions({
    groups: ['admin'],
  })
  async createUser(
    @Body() data: CreateUserDto,
    @AuthenticatedUser('isAdmin') isAdmin: boolean,
  ) {
    if (!isAdmin) {
      throw new ForbiddenException('Permission denied');
    }

    const user = await this.userModel.create({
      email: data.email,
      isAdmin: data.is_admin,
      username: data.username,
      password: data.password,
      fullName: data.full_name,
    });

    return new UserEntity(user.dataValues);
  }

  @Get()
  async getUsers(
    @LimitQuery() limit: number,
    @OffsetQuery() offset: number,
    @Trashed() trashed: boolean,
    @AuthenticatedUser('isAdmin') isAdmin: boolean,
  ) {
    if (!isAdmin) {
      throw new ForbiddenException('Permission denied');
    }

    const options: FindAndCountOptions = {
      paranoid: !trashed,
      limit,
      offset,
    };

    if (trashed) {
      const softDeleted: FindAndCountOptions = {
        where: {
          [UserModel.options.deletedAt as string]: { [Op.not]: null },
        },
      };

      Object.assign(options, softDeleted);
    }

    const { count, rows } = await this.userModel.findAndCountAll(options);
    const hasNext: boolean = offset + limit < count;

    return {
      count,
      data: rows.map((row) => new UserEntity(row.dataValues)),
      hasNext,
    };
  }

  @Get('search')
  async search(
    @Query('q') q: string | undefined,
    @LimitQuery() limit: number,
    @OffsetQuery() offset: number,
    @AuthenticatedUser('isAdmin') isAdmin: boolean,
  ) {
    const searchQuery: FindAndCountOptions<UserAttributes> = {
      where: {
        [Op.or]: [
          {
            username: {
              [Op.substring]: q,
            },
          },
          {
            fullName: {
              [Op.substring]: q,
            },
          },
        ],
      },
    };

    const transformGroups: string[] = [];
    const { count, rows } = await this.userModel.findAndCountAll(searchQuery);
    const hasNext: boolean = offset + limit < count;

    if (isAdmin) {
      transformGroups.push('admin');
    }

    return {
      count,
      data: instanceToPlain(
        rows.map((row) => new UserEntity(row.dataValues)),
        {
          groups: transformGroups,
        },
      ),
      hasNext,
    };
  }

  @Put('password')
  async updatePassword(
    @Body() body: ChangePasswordDto,
    @AuthenticatedUser('id') userId: number,
  ) {
    const user = await this.userModel.findByPk(userId);

    if (!this.userService.comparePassword(body.old_password, user.password)) {
      throw new BadRequestException('Incorrect current password');
    }

    await user.update({
      password: this.userService.encryptPassword(body.new_password),
    });

    return { success: true };
  }

  @Put('profile')
  @UseInterceptors(FileInterceptor('photo_profile'))
  @SerializeOptions({
    groups: ['self'],
  })
  async updateProfile(
    @Body() body: UpdateProfileDto,
    @UploadedFile(
      'file',
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)/i,
        })
        .build({
          fileIsRequired: false,
          exceptionFactory: (error) => {
            const errorResponse: ErrorFormat = {
              code: 400,
              error: 'FileUpload',
              message: error,
            };

            throw new BadRequestException(errorResponse);
          },
        }),
    )
    uploadedFile: Express.Multer.File,
    @AuthenticatedUser('id') userId: number,
  ) {
    const user = await this.userModel.findByPk(userId);

    if (uploadedFile?.buffer) {
      try {
        await sharp(uploadedFile.buffer).metadata();
        const objectStorage = await this.storageService.gCloudUpload({
          uploadedFile,
          saveOptions: { public: true },
        });

        user.setDataValue('photoProfile', objectStorage.url);
      } catch (error) {
        const errorResponse: ErrorFormat = {
          code: 400,
          error: 'FileUpload',
          message: error.message,
        };

        throw new BadRequestException(errorResponse);
      }
    }

    const errorResponse: ErrorFormat = {
      code: 400,
      error: 'ValidationError',
      message: 'Invalid request',
      errorItems: [],
    };

    if (body.email) {
      const isEmailRegistered = await this.userService.isEmailRegistered(
        body.email,
        user.id,
      );

      if (isEmailRegistered) {
        errorResponse.errorItems.push({
          property: 'email',
          constraints: {
            isRegistered: 'email already registered',
          },
        });
      }
    }

    if (body.username) {
      const isUsernameRegistered = await this.userService.isUsernameRegistered(
        body.username,
        user.id,
      );

      if (isUsernameRegistered) {
        errorResponse.errorItems.push({
          property: 'username',
          constraints: {
            isRegistered: 'username already registered',
          },
        });
      }
    }

    if (errorResponse.errorItems.length > 0) {
      throw new BadRequestException(errorResponse);
    }

    user.setDataValue('email', body.email || user.email);
    user.setDataValue('username', body.username || user.username);
    user.setDataValue('gender', body.gender || user.gender);
    user.setDataValue('fullName', body.full_name || user.fullName);

    await user.save();
    return new UserEntity(user.dataValues);
  }

  @Get('profile')
  @SerializeOptions({
    groups: ['self'],
  })
  async selfProfile(@AuthenticatedUser('id') userId: number) {
    const user = await this.userModel.findByPk(userId);

    return new UserEntity(user.dataValues);
  }

  @Get('profile/:userId')
  async viewProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @AuthenticatedUser('isAdmin') isAdmin: boolean,
  ) {
    const transformGroups: string[] = [];
    const user = await this.userModel.findByPk(userId);

    if (isAdmin) {
      transformGroups.push('admin');
    }

    return instanceToPlain(new UserEntity(user.dataValues), {
      groups: transformGroups,
    });
  }

  @Patch('profile/:userId')
  @SerializeOptions({
    groups: ['admin'],
  })
  async restore(
    @Param('userId', ParseIntPipe) userId: number,
    @AuthenticatedUser('isAdmin') isAdmin: boolean,
  ) {
    if (!isAdmin) {
      throw new ForbiddenException('Permission denied');
    }

    const user = await this.userModel.findByPk(userId, { paranoid: false });
    await user.restore();

    return new UserEntity(user.dataValues);
  }

  @HttpCode(200)
  @Post('batch/profile')
  async batchProfile(
    @Body() { userIds }: BatchUserDto,
    @AuthenticatedUser('isAdmin') isAdmin: boolean,
  ) {
    const transformGroups: string[] = [];
    const users = await this.userModel.findAll({
      where: {
        id: {
          [Op.in]: userIds,
        },
      },
    });

    if (isAdmin) {
      transformGroups.push('admin');
    }

    return instanceToPlain(
      users.map((user) => new UserEntity(user.dataValues)),
      {
        groups: transformGroups,
      },
    );
  }

  @Delete('profile/:userId?')
  async delete(
    @Trashed() trashed: boolean,
    @AuthenticatedUser() authenticatedUser: UserEntity,
    @Param('userId') userId?: string,
  ) {
    if (userId && parseInt(userId) !== authenticatedUser.id) {
      if (!authenticatedUser.isAdmin) {
        throw new ForbiddenException('Permission denied');
      }
    }

    const user = await this.userModel.findByPk(userId || authenticatedUser.id, {
      paranoid: !trashed,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await user.destroy({ force: trashed });

    return { success: true };
  }
}
