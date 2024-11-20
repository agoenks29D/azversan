import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from './app.type';
import { randomString } from './core/framework/helpers';

@Injectable()
export class AppMiddleware implements NestMiddleware {
  constructor(private logger: Logger) {}

  use(req: Request, res: Response, next: () => void) {
    /**
     * Get request uid
     */
    const uid = randomString(10);

    /**
     * Logging
     */
    this.logger.verbose(
      `${req.method} ${req.originalUrl} : ${uid}`,
      AppMiddleware.name,
    );

    /**
     * Set request unique id
     */
    req.uid = uid;

    next();
  }
}
