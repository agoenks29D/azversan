import { Dialect } from 'sequelize';
import { Environment } from '@/app.type';

export type DBConfig = {
  username: string;
  password: string | null;
  database: string;
  host: string;
  dialect: Dialect;
  logging: boolean;
  define: {
    charset: string;
    collate: string;
    freezeTableName: string;
  };
};

export type DBJsonConfig = Record<Environment, DBConfig>;

export type DatabaseTimestamps = {
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
};
