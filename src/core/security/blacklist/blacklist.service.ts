import { Inject, Injectable } from '@nestjs/common';
import { BlackListData, BlackListType } from './blacklist.type';

@Injectable()
export class BlacklistService {
  constructor(@Inject('BLACKLIST') private blacklist: BlackListData[]) {}

  /**
   * Retrieves all items in the blacklist.
   */
  getItems(): BlackListData[] {
    return this.blacklist;
  }

  /**
   * Adds a new item to the blacklist.
   * @param item - The BlackListData item to be added.
   */
  addItem(item: BlackListData): BlackListData[] {
    this.blacklist.push(item);
    return this.blacklist;
  }

  /**
   * Removes an item from the blacklist based on the provided type and value.
   * @param item - An object containing optional type and value to match.
   */
  removeItem(item: { type?: BlackListType; value?: string }): boolean {
    const index = this.blacklist.findIndex((blacklist) => {
      const typeMatch = item.type ? blacklist.type === item.type : true;
      const valueMatch = item.value ? blacklist.value === item.value : true;
      return typeMatch && valueMatch;
    });

    if (index !== -1) {
      this.blacklist.splice(index, 1);
      return true;
    }

    return false;
  }
}
