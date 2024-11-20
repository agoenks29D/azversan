import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get()
  async serverInfo() {
    const serverInfo = await this.appService.getServerInfo();
    return serverInfo;
  }
}
