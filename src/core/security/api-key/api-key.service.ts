import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { APIKeyData } from './api-key.type';
import { APIKeyModel } from './api-key.model';

@Injectable()
export class APIKeyService implements OnApplicationBootstrap {
  constructor(
    private logger: Logger,
    @Inject('API_KEYS') private apiKeys: APIKeyData[],
    @InjectModel(APIKeyModel) private apiKeyModel: typeof APIKeyModel,
  ) {}

  async onApplicationBootstrap() {
    const { count, rows } = await this.apiKeyModel.findAndCountAll();
    rows.forEach(({ id, key, label }) => {
      this.apiKeys.push({
        id,
        label,
        value: key,
      });
    });

    /**
     * Logging
     */
    this.logger.log(`${count} API keys loaded`, APIKeyService.name);
  }

  /**
   * Retrieves all stored API keys.
   */
  getKeys(): APIKeyData[] {
    return this.apiKeys;
  }

  /**
   * Generates a new API key with a specified label.
   * @param id - The id associated with the API key.
   * @param label - The label associated with the API key.
   * @param value - The authorization key of API service.
   */
  generateKey(id: number, label: string, value: string): APIKeyData {
    const apiKey: APIKeyData = { id, label, value };
    this.apiKeys.push(apiKey);

    return apiKey;
  }

  /**
   * Updates an existing item in the API key by its ID.
   * @param id - The ID of the item to update.
   * @param data - The new data for the item.
   */
  setItem(id: number, data: APIKeyData): boolean {
    const item = this.apiKeys.findIndex((item) => item.id === id);
    if (item !== -1) {
      this.apiKeys[item] = data;
      return true;
    }

    return false;
  }

  /**
   * Removes an API key by its value.
   * @param id - The id of the API key to remove.
   */
  removeKey(id: number): boolean {
    const index = this.apiKeys.findIndex((apiKey) => apiKey.id === id);

    if (index !== -1) {
      this.apiKeys.splice(index, 1);
      return true;
    }

    return false;
  }
}
