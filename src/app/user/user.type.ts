import { AuthTokenType } from '@/app/auth/auth.type';

export type UserGender = 'male' | 'female';

export type UserConfig = {
  /** User password salt */
  saltRounds: number;
};

export type JWTContentUserToken = {
  /** Token type */
  type: AuthTokenType;

  /** User id */
  userId: number;
};
