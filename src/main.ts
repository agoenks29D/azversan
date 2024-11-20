import { readFile } from 'fs/promises';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { VALIDATION_PIPE_OPTIONS } from './app.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,

    /**
     * HTTPS options configuration.
     * If ENABLE_HTTPS is set to 'true', SSL key and certificate are read from the specified files.
     */
    httpsOptions:
      process.env.ENABLE_HTTPS === 'true'
        ? {
            key: await readFile(process.env.SSL_KEY_FILE),
            cert: await readFile(process.env.SSL_CERT_FILE),
          }
        : undefined,
  });

  /**
   * Enable shutdown hooks for graceful termination.
   */
  app.enableShutdownHooks();

  /**
   * Use custom logger provided by Winston.
   */
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  /**
   * Use validation pipe globally with the default validation options.
   */
  app.useGlobalPipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS));

  /**
   * Start the application and listen on the specified port.
   * Default port is 3000 if not specified.
   */
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
