import { readFileSync } from 'node:fs';
import { registerAs } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { Dialect, ModelOptions } from 'sequelize';
import { Environment as Env, Environment } from '@/app.type';

export type DBConfig = {
  username: string;
  password: string | null;
  database: string;
  host: string;
  dialect: Dialect;
  logging: boolean;
  define: ModelOptions;
};

export type DBJsonConfig = Record<Environment, DBConfig>;

export default registerAs<SequelizeModuleOptions>('database', () => {
  const file = readFileSync(`${process.cwd()}/database/config.json`, 'utf-8');
  const DBConfig: DBJsonConfig = JSON.parse(file);
  const environment: Env = (process.env.NODE_ENV as Env) || 'production';
  const config: SequelizeModuleOptions = {
    dialect: DBConfig[environment]?.dialect || 'mysql',
    host: DBConfig[environment]?.host || 'localhost',
    username: DBConfig[environment]?.username,
    password: DBConfig[environment]?.password,
    database: DBConfig[environment]?.database,
    synchronize: process.env.DB_SYNC === 'true',
    autoLoadModels: true,
    sync: {
      alter: process.env.DB_MODE === 'alter',
      force: process.env.DB_MODE === 'force',
    },
    define: DBConfig[environment]?.define,
    logging: process.env.DB_LOG === 'true',
    timezone: process.env.DB_TIME,
  };

  return config;
});
