'use strict';

const axios = require('axios');

module.exports = () => ({
  /**
   * Gets the list of containers from the RAG service
   * @async
   * @function getRAGContainers
   * @param {string} token - The authentication token for authorization
   * @returns {Promise<Object>} The response containing the list of containers
   * @throws {Error} If the request fails
   * @description
   * Retrieves the RAG app URL from settings and makes an authenticated GET request
   * to fetch the list of containers/services. Returns the response if successful,
   * throws an error if the request fails.
   */
  async getRAGContainers(token) {
    // Get RAG app url from settings
    const ragUrl = await strapi
      .service('api::setting.setting')
      .getSetting('RAG_APP_URL')
      .then(url => JSON.parse(url));

    try {
      // Make request to RAG app
      const response = await axios.get(`${ragUrl}/manager/api/services`, {
        headers: {
          Cookie: `Authorization="Bearer ${token}"`,
        },
      });

      return response;
    } catch (error) {
      console.error('Error fetching RAG response:', error);
      throw error;
    }
  },

  /**
   * Makes a GET request to the RAG API endpoint
   * @async
   * @function getRAGApi
   * @param {string} token - The authentication token for authorization
   * @param {string} endpoint - The API endpoint path to send the request to
   * @returns {Promise<Object>} The response from the RAG API
   * @throws {Error} If the request fails
   * @description
   * Retrieves the RAG app URL from settings, ensures the endpoint has a leading slash,
   * and makes an authenticated GET request to the specified endpoint.
   * Returns the response if successful, throws an error if the request fails.
   */
  async getRAGApi(token, endpoint) {
    const ragUrl = await strapi
      .service('api::setting.setting')
      .getSetting('RAG_APP_URL')
      .then(url => JSON.parse(url));

    // Ensure endpoint starts with a slash
    endpoint = !endpoint.startsWith('/') ? `/${endpoint}` : endpoint;

    try {
      const response = await axios.get(`${ragUrl}${endpoint}`, {
        headers: {
          Cookie: `Authorization="Bearer ${token}"`,
        },
      });
      return response;
    } catch (error) {
      console.error('Error fetching RAG response:', error);
      throw error;
    }
  },

  /**
   * Makes a POST request to the RAG API endpoint
   * @async
   * @function postRAGApi
   * @param {Object} payload - The data payload to send in the POST request
   * @param {string} endpoint - The API endpoint path to send the request to
   * @param {string} token - The authentication token for authorization
   * @returns {Promise<Object>} The response from the RAG API
   * @throws {Error} If the request fails
   * @description
   * Retrieves the RAG app URL from settings, ensures the endpoint has a leading slash,
   * and makes an authenticated POST request to the specified endpoint with the given payload.
   * Returns the response if successful, throws an error if the request fails.
   */
  async postRAGApi(payload, endpoint, token) {
    const ragUrl = await strapi
      .service('api::setting.setting')
      .getSetting('RAG_APP_URL')
      .then(url => JSON.parse(url));

    // Ensure endpoint starts with a slash
    endpoint = !endpoint.startsWith('/') ? `/${endpoint}` : endpoint;

    try {
      const response = await axios.post(`${ragUrl}${endpoint}`, payload, {
        headers: {
          Cookie: `Authorization="Bearer ${token}"`,
        },
      });
      return response;
    } catch (error) {
      console.error('Error posting to RAG API:', error);
      throw error;
    }
  },
  async putRAGApi(payload, endpoint, token, itemId) {
    const ragUrl = await strapi
      .service('api::setting.setting')
      .getSetting('RAG_APP_URL')
      .then(url => JSON.parse(url));

    // Ensure endpoint starts with a slash
    endpoint = !endpoint.startsWith('/') ? `/${endpoint}` : endpoint;

    try {
      const url = itemId ? `${ragUrl}${endpoint}/${itemId}` : `${ragUrl}${endpoint}`;
      const response = await axios.put(url, payload, {
        headers: {
          Cookie: `Authorization="Bearer ${token}"`,
        },
      });
      return response;
    } catch (error) {
      console.error('Error putting to RAG API:', error);
      throw error;
    }
  },
});
