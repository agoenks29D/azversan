import { Optional } from 'sequelize';
import { AllowNull, Column, Model, Table } from 'sequelize-typescript';
import { DatabaseTimestamps } from './database.type';

type TestAttributes = {
  id: number;
  name: string;
  value: string;
} & Omit<DatabaseTimestamps, 'deleted_at'>;

type TestCreationAttributes = Optional<
  TestAttributes,
  'id' | keyof Omit<DatabaseTimestamps, 'deleted_at'>
>;

@Table({
  paranoid: false,
  tableName: 'test',
})
export class TestModel
  extends Model<TestAttributes, TestCreationAttributes>
  implements TestCreationAttributes
{
  @AllowNull(false)
  @Column
  name: string;

  @AllowNull(false)
  @Column
  value: string;
}
