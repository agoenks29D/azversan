import { registerAs } from '@nestjs/config';
import { UserConfig } from './user.type';

export default registerAs<UserConfig>('user', () => {
  const config: UserConfig = {
    saltRounds: 10,
  };

  return config;
});
