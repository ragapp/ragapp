'use strict';

/**
 * setting service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::setting.setting', ({ strapi }) => ({
  /**
   * Retrieves a setting value by its key
   * @async
   * @function getSetting
   * @param {string} key - The unique key identifying the setting
   * @returns {Promise<any>} The value of the setting if found, null otherwise
   * @throws {Error} If key is invalid or if database query fails
   * @description
   * Fetches a single setting from the database by its key.
   * Validates that the key is a non-empty string.
   * Returns null if no setting is found with the given key.
   * Logs and re-throws any database errors that occur.
   */
  async getSetting(key) {
    // Validate input
    if (!key || typeof key !== 'string') {
      throw new Error('Setting key must be a non-empty string');
    }

    try {
      const result = await strapi.documents('api::setting.setting').findMany({
        filters: { key: key },
        limit: 1,
      });

      return result.length > 0 ? result[0].value : null;
    } catch (error) {
      strapi.log.error(`Failed to fetch setting with key "${key}":`, error);
      throw new Error(`Failed to fetch setting: ${error.message}`);
    }
  },
}));
