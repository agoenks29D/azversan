/**
 * Blacklist type
 */
export type BlackListType = 'IP' | 'DeviceID';

/**
 * Blacklist item
 */
export type BlackListData = {
  id: number;
  type: BlackListType;
  value: string;
};
