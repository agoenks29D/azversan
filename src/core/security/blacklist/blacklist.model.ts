import { Optional } from 'sequelize';
import {
  AllowNull,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { DatabaseTimestamps } from '@/core/database/database.type';
import { BlackListType } from './blacklist.type';

type BlacklistAttributes = {
  id: number;
  type: BlackListType;
  value: string;
  description: string;
} & Omit<DatabaseTimestamps, 'deleted_at'>;

type BlacklistCreationAttributes = Optional<BlacklistAttributes, 'id'>;

@Table({
  paranoid: false,
  tableName: 'blacklist',
})
export class BlacklistModel extends Model<
  BlacklistAttributes,
  BlacklistCreationAttributes
> {
  @AllowNull(false)
  @Column(DataType.ENUM<BlackListType>('DeviceID', 'IP'))
  type: BlackListType;

  @AllowNull(false)
  @Column
  value: string;

  @AllowNull
  @Column
  description: string;
}
