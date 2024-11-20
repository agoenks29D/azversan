import { Injectable } from '@nestjs/common';
import sysinfo from 'systeminformation';

@Injectable()
export class AppService {
  /**
   * Retrieves server information including CPU details, OS platform and release,
   * and system model and manufacturer.
   *
   * This method uses the `systeminformation` package to fetch various hardware
   * and operating system information asynchronously.
   *
   * @returns {Promise<object>} A promise that resolves to an object containing information about the server's CPU, OS, and system model.
   */
  async getServerInfo() {
    const serverInfo = await sysinfo.get({
      cpu: '*',
      osInfo: 'platform, release',
      system: 'model, manufacturer',
    });

    return serverInfo;
  }
}
