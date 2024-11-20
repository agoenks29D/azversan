export type SecurityConfig = {
  /**
   * Enables the API key authentication check
   */
  apiKeyAuthEnable: boolean;

  /**
   * API key authentication header key name
   */
  apiKeyAuthKeyName: string;

  /**
   * Enables blacklist security check of blocked devices or IP addresses
   */
  blacklistEnable: boolean;

  /**
   * Key name of device ID used for identification
   */
  deviceIdKeyName: string;

  /**
   * Enables the JWT authentication check
   */
  jwtEnable: boolean;

  /**
   * JWT secret key
   */
  jwtSecretKey: string;

  /**
   * Expiration using ms package
   * @see https://github.com/vercel/ms
   */
  jwtExpiration: string;
};
