import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { LimitQuery, OffsetQuery } from '@/core/framework/decorators';
import { BlacklistModel } from './blacklist.model';
import { BlacklistService } from './blacklist.service';
import { BlacklistDto, UpdateBlacklistDto } from './blacklist.dto';

@Controller('blacklist')
export class BlacklistController {
  constructor(
    private blacklistService: BlacklistService,
    @InjectModel(BlacklistModel) private blacklistModel: typeof BlacklistModel,
  ) {}

  @Get()
  async getBlacklist(
    @LimitQuery() limit: number,
    @OffsetQuery() offset: number,
  ) {
    const { count, rows } = await this.blacklistModel.findAndCountAll({
      limit,
      offset,
    });
    const hasNext: boolean = offset + limit < count;

    return { count, rows, hasNext };
  }

  @Post()
  async addBlacklist(@Body() { type, value, description }: BlacklistDto) {
    const { dataValues } = await this.blacklistModel.create({
      type,
      value,
      description,
    });

    this.blacklistService.addItem({ id: dataValues.id, type, value });
    return dataValues;
  }

  @Patch(':id')
  async updateBlacklist(
    @Param('id', ParseIntPipe) id: number,
    @Body() { type, value, description }: UpdateBlacklistDto,
  ) {
    const blacklist = await this.blacklistModel.findByPk(id);

    if (!blacklist) {
      throw new NotFoundException('Item not found');
    }

    const { dataValues } = await blacklist.update({
      type,
      value,
      description,
    });
    this.blacklistService.setItem(id, dataValues);

    return dataValues;
  }

  @Delete(':id')
  async deleteBlacklist(@Param('id', ParseIntPipe) id: number) {
    const blacklist = await this.blacklistModel.findByPk(id);

    if (!blacklist) {
      throw new NotFoundException('Item not found');
    }

    await blacklist.destroy();
    this.blacklistService.removeItem(id);

    return { deleted: true };
  }
}
