import { Optional } from 'sequelize';
import {
  AllowNull,
  BelongsTo,
  Column,
  Default,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { DatabaseTimestamps } from '@/core/database/database.type';
import { UserModel } from '@/app/user/models';

export type AuthVerifyAttributes = {
  id: number;
  code: string;
  token: string;
  purpose: string;
  codeIsUsed: boolean;
  tokenIsUsed: boolean;
  expiresAt: Date;
  userId: number;
} & Omit<DatabaseTimestamps, 'deleted_at'>;

type AuthVerifyCreationAttributes = Optional<
  AuthVerifyAttributes,
  'id' | keyof Omit<DatabaseTimestamps, 'deleted_at'>
>;

@Table({
  paranoid: false,
  tableName: 'auth_verify',
})
export class AuthVerifyModel
  extends Model<AuthVerifyAttributes, AuthVerifyCreationAttributes>
  implements AuthVerifyCreationAttributes
{
  @AllowNull(false)
  @Column
  code: string;

  @AllowNull
  @Column
  token: string;

  @AllowNull(false)
  @Column
  purpose: string;

  @AllowNull(false)
  @Default(false)
  @Column
  codeIsUsed: boolean;

  @AllowNull(false)
  @Default(false)
  @Column
  tokenIsUsed: boolean;

  @AllowNull(false)
  @Column
  expiresAt: Date;

  @ForeignKey(() => UserModel)
  @Column
  userId: number;

  @BelongsTo(() => UserModel)
  user: UserModel;
}
