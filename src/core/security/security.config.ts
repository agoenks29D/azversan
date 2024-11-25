import { registerAs } from '@nestjs/config';
import { SecurityConfig } from './security.type';

export default registerAs<SecurityConfig>('security', () => {
  const config: SecurityConfig = {
    apiKeyAuthEnable: process.env.API_KEY_AUTH === 'true',
    apiKeyAuthKeyName: process.env.API_KEY_AUTH_KEY_NAME || 'X-API-KEY',
    blacklistEnable: process.env.BLACKLIST_ENABLE === 'true',
    deviceIdKeyName: process.env.DEVICE_ID_KEY_NAME || 'X-DEVICE-ID',
    jwtEnable: process.env.JWT_AUTH === 'true',
    jwtSecretKey: process.env.JWT_SECRET || 'JWTSecret',
    jwtExpiration: process.env.JWT_EXPIRATION || '4h',
  };

  return config;
});
