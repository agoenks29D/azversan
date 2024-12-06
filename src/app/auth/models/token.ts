import { Optional } from 'sequelize';
import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { DatabaseTimestamps } from '@/core/database/database.type';
import { AuthTokenType } from '@/app/auth/auth.type';
import { UserModel } from '@/app/user/models';

export type AuthTokenAttributes = {
  id: number;
  type: AuthTokenType;
  token: string;
  isRevoked: boolean;
  userId: number;
  expiresAt: Date;
} & Omit<DatabaseTimestamps, 'deleted_at'>;

type AuthTokenCreationAttributes = Optional<
  AuthTokenAttributes,
  'id' | keyof Omit<DatabaseTimestamps, 'deleted_at'>
>;

@Table({
  paranoid: false,
  tableName: 'auth_tokens',
})
export class AuthTokenModel
  extends Model<AuthTokenAttributes, AuthTokenCreationAttributes>
  implements AuthTokenCreationAttributes
{
  @AllowNull(false)
  @Column(DataType.ENUM<AuthTokenType>('access', 'refresh'))
  type: 'access' | 'refresh';

  @AllowNull(false)
  @Column(DataType.TEXT)
  token: string;

  @AllowNull(false)
  @Default(false)
  @Column
  isRevoked: boolean;

  @AllowNull(false)
  @Column
  expiresAt: Date;

  @AllowNull(false)
  @ForeignKey(() => UserModel)
  @Column
  userId: number;

  @BelongsTo(() => UserModel)
  user: UserModel;
}
