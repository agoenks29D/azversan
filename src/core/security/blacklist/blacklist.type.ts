/**
 * Blacklist type
 */
export type BlackListType = 'IP' | 'DeviceID';

/**
 * Blacklist item
 */
export type BlackListData = {
  type: BlackListType;
  value: string;
};
