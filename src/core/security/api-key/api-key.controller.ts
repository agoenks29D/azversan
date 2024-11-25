import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { LimitQuery, OffsetQuery, Trashed } from '@/core/framework/decorators';
import { randomString } from '@/core/framework/helpers';
import { APIKeyModel } from './api-key.model';
import { APIKeyService } from './api-key.service';
import { APIKeyDto, UpdateAPIKeyDto } from './api-key.dto';

@Controller('api-keys')
export class ApiKeyController {
  constructor(
    private apiKeyService: APIKeyService,
    @InjectModel(APIKeyModel) private apiKeyModel: typeof APIKeyModel,
  ) {}

  @Get()
  async getKeys(
    @LimitQuery() limit: number,
    @OffsetQuery() offset: number,
    @Trashed() trashed: boolean,
  ) {
    const { count, rows } = await this.apiKeyModel.findAndCountAll({
      limit,
      offset,
      paranoid: !trashed,
      where: {
        deleted_at: {
          [trashed ? Op.ne : Op.eq]: null,
        },
      },
    });
    const hasNext: boolean = offset + limit < count;

    return { count, rows, hasNext };
  }

  @Post()
  async newKey(@Body() { key, label, description }: APIKeyDto) {
    const { dataValues } = await this.apiKeyModel.create({
      key: key || randomString(10),
      label,
      description,
    });

    this.apiKeyService.generateKey(
      dataValues.id,
      dataValues.label,
      dataValues.key,
    );
    return dataValues;
  }

  @Put(':id')
  async updateKey(
    @Param('id', ParseIntPipe) id: number,
    @Body() { key, label, description }: UpdateAPIKeyDto,
  ) {
    const apiKey = await this.apiKeyModel.findByPk(id);

    if (!apiKey) {
      throw new HttpException('API key not found', HttpStatus.NOT_FOUND);
    }

    const { dataValues } = await apiKey.update({ key, label, description });
    this.apiKeyService.setItem(id, {
      id,
      label,
      value: dataValues.key,
    });

    return dataValues;
  }

  @Patch(':id')
  async restoreDeleted(@Param('id', ParseIntPipe) id: number) {
    const apiKey = await this.apiKeyModel.findByPk(id, { paranoid: false });

    if (!apiKey) {
      throw new HttpException('API key not found', HttpStatus.NOT_FOUND);
    }

    await apiKey.restore();
    const { dataValues } = apiKey;
    this.apiKeyService.generateKey(id, dataValues.label, dataValues.key);

    return dataValues;
  }

  @Delete(':id')
  async destroy(
    @Param('id', ParseIntPipe) id: number,
    @Trashed() trashed: boolean,
  ) {
    const apiKey = await this.apiKeyModel.findByPk(id, { paranoid: !trashed });

    if (!apiKey) {
      throw new HttpException('API key not found', HttpStatus.NOT_FOUND);
    }

    await apiKey.destroy({ force: trashed });
    this.apiKeyService.removeKey(apiKey.id);

    return { deleted: true, force: trashed };
  }
}
