import { ValidationError } from '@nestjs/common';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { SecurityConfig } from './core/security/security.type';
import { StorageConfig } from './core/storage/storage.type';
import { UserEntity } from './app/user/user.entity';
import { UserConfig } from './app/user/user.type';

/**
 * Application environment
 */
export type Environment = 'development' | 'test' | 'production';

export type AppConfig = {
  /**
   * Name of the application
   */
  appName: string;

  /**
   * Current environment the app is running in
   */
  environment: Environment;
};

export type AllConfigType = AppConfig & {
  // Define for all config type
  database: SequelizeModuleOptions; // Database config module
  security: SecurityConfig; // Security config module
  storage: StorageConfig; // Storage config module
  user: UserConfig; // User config module
};

export type Request = ExpressRequest & {
  /**
   * Unique identifier each request
   */
  uid: string;

  /**
   * Authenticated user
   */
  user?: UserEntity;
};

export type Response = ExpressResponse;

export type ErrorFormat = {
  /**
   * HTTP error code or a custom error code.
   */
  code: number;

  /**
   * A readable error message for developer debugging.
   */
  error?: string;

  /**
   * An error message intended for the end user.
   */
  message?: string;

  /**
   * A list of validation error items.
   */
  errorItems?: ValidationError[];
};
