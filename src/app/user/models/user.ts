import { Optional } from 'sequelize';
import {
  AllowNull,
  Column,
  DataType,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';
import { DatabaseTimestamps } from '@/core/database/database.type';
import { UserGender } from '../user.type';
import { listOfUserGender } from '../user.constant';

export type UserAttributes = {
  id: number;
  email: string;
  username: string;
  password: string;
  isAdmin: boolean;
  gender: UserGender;
  fullName: string;
  photoProfile: string | null;
} & DatabaseTimestamps;

type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | keyof DatabaseTimestamps
>;

@Table({
  paranoid: true,
  tableName: 'users',
})
export class UserModel
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserCreationAttributes
{
  @AllowNull(false)
  @Unique
  @Column
  email: string;

  @AllowNull(false)
  @Unique
  @Column
  username: string;

  @AllowNull
  @Column
  password: string;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  isAdmin: boolean;

  @AllowNull
  @Column(DataType.ENUM<UserGender>(...listOfUserGender))
  gender: UserGender;

  @AllowNull(false)
  @Column
  fullName: string;

  @AllowNull
  @Column
  photoProfile: string;
}
