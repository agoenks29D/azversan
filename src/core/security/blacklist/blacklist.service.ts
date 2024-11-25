import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BlackListData } from './blacklist.type';
import { BlacklistModel } from './blacklist.model';

@Injectable()
export class BlacklistService implements OnApplicationBootstrap {
  constructor(
    private logger: Logger,
    @Inject('BLACKLIST') private blacklist: BlackListData[],
    @InjectModel(BlacklistModel) private blacklistModel: typeof BlacklistModel,
  ) {}

  async onApplicationBootstrap() {
    const { count, rows } = await this.blacklistModel.findAndCountAll();
    rows.forEach(({ id, type, value }) => {
      this.blacklist.push({ id, type, value });
    });

    /**
     * Logging
     */
    this.logger.log(`${count} Blacklist loaded`, BlacklistService.name);
  }

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
   * Updates an existing item in the blacklist by its ID.
   * @param id - The ID of the item to update.
   * @param data - The new data for the item.
   */
  setItem(id: number, data: BlackListData): boolean {
    const item = this.blacklist.findIndex((item) => item.id === id);
    if (item !== -1) {
      this.blacklist[item] = data;
      return true;
    }

    return false;
  }

  /**
   * Removes an item from the blacklist.
   * @param id - The ID of the item to remove.
   */
  removeItem(id: number): boolean {
    const index = this.blacklist.findIndex((blacklist) => blacklist.id === id);

    if (index !== -1) {
      this.blacklist.splice(index, 1);
      return true;
    }

    return false;
  }
}
