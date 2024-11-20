import { Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { APIKeyData } from './api-key.type';

@Injectable()
export class APIKeyService {
  constructor(@Inject('API_KEYS') private apiKeys: APIKeyData[]) {}

  /**
   * Retrieves all stored API keys.
   */
  getKeys(): APIKeyData[] {
    return this.apiKeys;
  }

  /**
   * Generates a new API key with a specified label.
   * @param label - The label associated with the API key.
   */
  generateKey(label: string, value?: string): APIKeyData {
    const apiKey: APIKeyData = { label, value: (value ??= v4()) };
    this.apiKeys.push(apiKey);

    return apiKey;
  }

  /**
   * Removes an API key by its value.
   * @param key - The value of the API key to remove.
   */
  removeKey(key: string): boolean {
    const index = this.apiKeys.findIndex((apiKey) => apiKey.value === key);

    if (index !== -1) {
      this.apiKeys.splice(index, 1);
      return true;
    }

    return false;
  }
}
