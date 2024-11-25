import { Optional } from 'sequelize';
import { AllowNull, Column, Model, Table } from 'sequelize-typescript';
import { DatabaseTimestamps } from '@/core/database/database.type';

type APIKeyAttributes = {
  id: number;
  key: string;
  label: string;
  description: string;
} & DatabaseTimestamps;

type APIKeyCreationAttributes = Optional<
  APIKeyAttributes,
  'id' | keyof DatabaseTimestamps
>;

@Table({
  paranoid: true,
  tableName: 'api_keys',
})
export class APIKeyModel extends Model<
  APIKeyAttributes,
  APIKeyCreationAttributes
> {
  @AllowNull(false)
  @Column
  key: string;

  @AllowNull(false)
  @Column
  label: string;

  @AllowNull
  @Column
  description: string;
}
