'use strict';

const axios = require('axios');
const qs = require('qs');

module.exports = {
  /**
   * Retrieves authentication credentials from Strapi settings
   * @async
   * @function getAuthCredentials
   * @returns {Promise<Object>} Object containing authentication credentials:
   *   - clientId {string} The client ID (defaults to 'api')
   *   - clientSecret {string} The client secret
   *   - username {string} The username (defaults to 'manager')
   *   - password {string} The password (defaults to '123456')
   * @throws {Error} If RAG authentication configuration is not found in settings
   * @description
   * Retrieves RAG authentication credentials from Strapi settings.
   * Looks for a setting with key 'RAG_AUTH_CONFIG' and returns the credentials.
   * Will use default values for clientId, username and password if not specified.
   */
  async getAuthCredentials() {
    const setting = await strapi
      .service('api::setting.setting')
      .getSetting('RAG_AUTH_CONFIG');

    if (!setting) {
      throw new Error('RAG authentication configuration not found in settings');
    }

    const config = typeof setting === 'string' ? JSON.parse(setting) : setting;
    return {
      clientId: config.client_id || 'api',
      clientSecret: config.client_secret,
      username: config.username || 'manager',
      password: config.password || '123456',
    };
  },

  /**
   * Retrieves an authentication token from the RAG service
   * @async
   * @function getAuthToken
   * @returns {Promise<Object>} The authentication response data containing access token and expiry
   * @throws {Error} If authentication fails
   * @description
   * Makes a POST request to the RAG authentication endpoint using credentials from getAuthCredentials().
   * Returns the response data containing the access token if successful.
   * Throws an error if authentication fails.
   */
  async getAuthToken() {
    const credentials = await this.getAuthCredentials();

    const data = qs.stringify({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      grant_type: 'password',
      username: credentials.username,
      password: credentials.password,
    });

    try {
      const response = await axios.post(
        'https://rag.lawvo.com/auth/realms/ragapp/protocol/openid-connect/token',
        data,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('RAG authentication error:', error.message);
      throw new Error('Failed to authenticate with RAG service');
    }
  },

  /**
   * Gets a valid authentication token for the RAG service
   * @async
   * @function getValidToken
   * @returns {Promise<string>} A valid access token for authenticating with the RAG service
   * @throws {Error} If unable to retrieve or create token settings
   * @description
   * Checks for an existing valid token in Strapi settings.
   * If a valid token exists and has not expired, returns it.
   * Otherwise, gets a new token via getAuthToken() and saves it and its expiration
   * to Strapi settings before returning it.
   * Handles both creating new settings and updating existing ones.
   */
  async getValidToken() {
    const tokenSetting = await strapi
      .service('api::setting.setting')
      .getSetting('RAG_ACCESS_TOKEN');
    const expirationSetting = await strapi
      .service('api::setting.setting')
      .getSetting('RAG_TOKEN_EXPIRATION');

    const currentTime = new Date().getTime();
    const tokenExpiration = expirationSetting;

    // If token exists and is not expired, return it
    if (tokenSetting && tokenExpiration && currentTime < Number(tokenExpiration)) {
      return JSON.parse(String(tokenSetting));
    }

    // Otherwise, get new token
    const authData = await this.getAuthToken();

    // Save new token and expiration
    const expirationTime = currentTime + authData.expires_in * 1000;

    // Update or create token setting
    if (tokenSetting) {
      await strapi.documents('api::setting.setting').update({
        documentId: String(tokenSetting),
        data: { value: JSON.stringify(authData.access_token) },
      });
    } else {
      await strapi.documents('api::setting.setting').create({
        data: {
          key: 'RAG_ACCESS_TOKEN',
          value: JSON.stringify(authData.access_token),
          description: 'RAG API access token',
        },
      });
    }

    // Update or create expiration setting
    if (expirationSetting) {
      await strapi.documents('api::setting.setting').update({
        documentId: String(expirationSetting),
        data: { value: expirationTime },
      });
    } else {
      await strapi.documents('api::setting.setting').create({
        data: {
          key: 'RAG_TOKEN_EXPIRATION',
          value: expirationTime,
          description: 'RAG API token expiration timestamp',
        },
      });
    }

    return authData.access_token;
  },
};
