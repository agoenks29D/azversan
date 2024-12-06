import {
  HttpException,
  HttpStatus,
  ValidationPipeOptions,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModuleOptions, utilities } from 'nest-winston';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { AppConfig, Environment, ErrorFormat } from './app.type';

/**
 * Default options for validation pipe.
 * @see https://docs.nestjs.com/techniques/validation#using-the-built-in-validationpipe
 */
export const VALIDATION_PIPE_OPTIONS: ValidationPipeOptions = {
  /**
   * To enable auto-transformation, set transform to true
   */
  transform: true,

  /**
   * If set to true, the validator will print extra warning messages
   * to the console when something is not right.
   */
  enableDebugMessages: true,

  /**
   * If set to true, the validator will skip validation
   * of all properties that are undefined in the validating object.
   */
  skipUndefinedProperties: false,

  /**
   * If set to true, the validator will skip validation
   * of all properties that are null in the validating object.
   */
  skipNullProperties: false,

  /**
   * If set to true, the validator will skip validation
   * of all properties that are null or undefined
   * in the validating object.
   */
  skipMissingProperties: false,

  /**
   * If set to true, the validator will strip validated (returned)
   * object of any properties that do not use any validation decorators.
   */
  whitelist: false,

  /**
   * If set to true, instead of stripping non-whitelisted properties,
   * the validator will throw an exception.
   */
  forbidNonWhitelisted: false,

  /**
   * If set to true, attempts to validate unknown objects will fail immediately.
   * IMPORTANT: The forbidUnknownValues value is set to true by default,
   * and it is highly advised to keep the default.
   * Setting it to false will result in unknown objects passing the validation!
   */
  forbidUnknownValues: true,

  /**
   * If set to true, validation errors will not be returned to the client.
   */
  disableErrorMessages: false,

  /**
   * This setting allows you to specify which exception type
   * will be used in case of an error. By default, it throws BadRequestException.
   */
  errorHttpStatusCode: 400,

  /**
   * Takes an array of the validation errors and returns an exception object
   * to be thrown.
   */
  exceptionFactory: (errors) => {
    const errorFormat: ErrorFormat = {
      code: 400,
      error: 'ValidationError',
      message: 'Invalid request',
      errorItems: errors,
    };

    return new HttpException(errorFormat, HttpStatus.BAD_REQUEST);
  },

  /**
   * Groups to be used during validation of the object.
   */
  groups: [],

  /**
   * Set default for always option of decorators.
   * Default can be overridden in decorator options.
   */
  always: false,

  /**
   * If groups are not given or are empty, ignore decorators with at least one group.
   */
  strictGroups: false,

  /**
   * If set to true, the validation will not use default messages.
   * Error messages will always be undefined if they are not explicitly set.
   */
  dismissDefaultMessages: false,

  validationError: {
    /**
     * Indicates if the target should be exposed in ValidationError.
     */
    target: false,

    /**
     * Indicates if the validated value should be exposed in ValidationError.
     */
    value: true,
  },

  /**
   * When set to true, validation of the given property will stop
   * after encountering the first error. Defaults to false.
   */
  stopAtFirstError: true,
};

/**
 * Winston config factory
 * @see https://github.com/gremo/nest-winston
 */
export const winstonConfigFactory = async (
  configService: ConfigService<AppConfig>,
): Promise<WinstonModuleOptions> => ({
  level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  exitOnError: false,
  handleExceptions: true,
  handleRejections: true,
  transports: [
    new winston.transports.Console({
      silent: configService.get('environment') === 'production',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        utilities.format.nestLike(configService.get('appName'), {
          colors: true,
          appName: true,
          processId: true,
          prettyPrint: true,
        }),
      ),
    }),
    new winston.transports.DailyRotateFile({
      level: 'debug',
      filename: 'logs/debug/%DATE%.log',
      datePattern: 'YYYY.MM.DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: null,
      format: winston.format.combine(
        winston.format.timestamp(),
        utilities.format.nestLike(configService.get('appName'), {
          colors: false,
          appName: false,
          processId: false,
          prettyPrint: true,
        }),
      ),
    }),
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: 'logs/error/%DATE%.log',
      datePattern: 'YYYY.MM.DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: null,
      format: winston.format.combine(
        winston.format.timestamp(),
        utilities.format.nestLike(configService.get('appName'), {
          colors: false,
          appName: false,
          processId: false,
          prettyPrint: true,
        }),
      ),
    }),
  ],
});

export default () => {
  const config: AppConfig = {
    appName: process.env.APP_NAME || 'Nest.js Boilerplate',
    environment: (process.env.NODE_ENV as Environment) || 'production',
  };

  return config;
};
