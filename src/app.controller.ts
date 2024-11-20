import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { APIKeyService } from './core/security/api-key/api-key.service';
import { DisableAPIKey } from './core/security/api-key/api-key.decorator';
import { BlacklistService } from './core/security/blacklist/blacklist.service';
import { DisableBearerToken } from './core/security/bearer-token/bearer-token.decorator';
import { AppService } from './app.service';
import {
  AddBlacklistItemDto,
  CreateAPIKeyDto,
  CreateJwtDto,
  RemoveBlacklistItemDto,
} from './app.dto';

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    private apiKeyService: APIKeyService,
    private blacklistService: BlacklistService,
    private jwtService: JwtService,
  ) {}

  @Get()
  async serverInfo() {
    const serverInfo = await this.appService.getServerInfo();
    return serverInfo;
  }

  @Get('api-keys')
  getApiKeys() {
    return this.apiKeyService.getKeys();
  }

  @DisableAPIKey()
  @DisableBearerToken()
  @Post('api-keys')
  generateApiKey(@Body() { label }: CreateAPIKeyDto) {
    const apiKey = this.apiKeyService.generateKey(label);
    return apiKey;
  }

  @Delete('api-keys/:key')
  removeApiKey(@Param('key') key: string) {
    const removed = this.apiKeyService.removeKey(key);
    if (!removed) {
      throw new HttpException(
        "Blacklist item doesn't exist",
        HttpStatus.NOT_FOUND,
      );
    }

    return { removed };
  }

  @DisableBearerToken()
  @Post('jwt')
  generateJwt(@Body() { userId }: CreateJwtDto) {
    const token = this.jwtService.sign({ userId });
    return { token };
  }

  @Get('blacklist')
  getBlacklist() {
    return this.blacklistService.getItems();
  }

  @Post('blacklist')
  addBlacklist(@Body() { type, value }: AddBlacklistItemDto) {
    const blacklist = this.blacklistService.addItem({ type, value });
    return blacklist;
  }

  @Delete('blacklist')
  removeBlacklist(@Body() { type, value }: RemoveBlacklistItemDto) {
    const removed = this.blacklistService.removeItem({ type, value });
    if (!removed) {
      throw new HttpException(
        "Blacklist item doesn't exist",
        HttpStatus.NOT_FOUND,
      );
    }

    return { removed };
  }
}
