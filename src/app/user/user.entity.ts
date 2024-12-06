import { Exclude, Expose } from 'class-transformer';
import { UserGender } from './user.type';

export class UserEntity {
  id: number;

  @Expose({ groups: ['self', 'admin'] })
  email: string;

  username: string;

  @Exclude()
  password: string;

  isAdmin: boolean;

  gender: UserGender;

  fullName: string;

  photoProfile: string;

  @Expose({ groups: ['admin'] })
  created_at: Date;

  @Expose({ groups: ['admin'] })
  updated_at: Date;

  @Expose({ groups: ['admin'] })
  deleted_at: Date;

  constructor(properties: Partial<UserEntity>) {
    Object.assign(this, properties);
  }
}
