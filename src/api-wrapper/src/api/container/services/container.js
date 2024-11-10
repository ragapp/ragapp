'use strict';

/**
 * container service
 */

const axios = require('axios');

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::container.container', ({ strapi }) => ({
  async getContainer(containerName) {
    return await strapi.documents('api::container.container').findMany({
      filters: { name: containerName },
    })[0];
  },

  /**
   * Retrieves unconfigured containers created before a specified time
   * @async
   * @function getUnconfiguredContainers
   * @param {number} timeDiffInMinutes - Time difference in minutes to check against (default: 1)
   * @returns {Promise<Array>} Array of unconfigured container documents
   * @description
   * Finds all container documents where configured=false and createdAt is less than
   * the specified time difference from now. This helps identify containers that
   * have not been configured within the expected timeframe.
   */
  async getUnconfiguredContainers(timeDiffInMinutes = 1) {
    const timeAgo = new Date(Date.now() - timeDiffInMinutes * 60 * 1000).toISOString();

    const unconfiguredContainers = await strapi
      .documents('api::container.container')
      .findMany({
        filters: {
          configured: false,
          createdAt: {
            $lt: timeAgo,
          },
        },
      });

    return unconfiguredContainers;
  },

  /**
   * Checks if a container is configured by making a request to the RAG API
   * @async
   * @function checkContainerConfiguration
   * @param {Object} container - The container object to check configuration for
   * @param {string} container.name - The name of the container
   * @returns {Promise<boolean>} Whether the container is configured
   * @throws {Error} If there is an error checking the configuration status
   * @description
   * Makes an authenticated request to the RAG API to check if the specified container
   * has been configured. Returns the configuration status from the API response.
   * Throws an error if the request fails.
   */
  async checkContainerConfiguration(container) {
    try {
      const token = await strapi.service('api::custom.rag-auth').getValidToken();
      const response = await strapi
        .service('api::custom.rag-api')
        .getRAGApi(token, `/a/${container.name}/api/management/config/is_configured`);
      return response.data;
    } catch (error) {
      console.error('Error fetching configuration status:', error);
      throw error;
    }
  },

  async configureContainer(container) {
    const isConfigured = await this.checkContainerConfiguration(container);

    if (isConfigured) {
      await strapi.documents('api::container.container').update({
        documentId: container.documentId,
        data: {
          configured: true,
        },
      });
    }

    let configData = {};

    switch (container.assistantType) {
      case 'OpenAI':
        const openAiConfig = await strapi
          .service('api::setting.setting')
          .getSetting('OPENAI_CONFIG');

        configData = {
          model_provider: 'openai',
          openai_api_key: openAiConfig.API_KEY,
          openai_api_base: openAiConfig.API_BASE,
          model: openAiConfig.MODEL,
          embedding_model: openAiConfig.EMBEDDING_MODEL,
        };
        break;
      case 'Gemini':
        const geminiConfig = await strapi
          .service('api::setting.setting')
          .getSetting('GEMINI_CONFIG');

        configData = {
          model_provider: 'gemini',
          google_api_key: geminiConfig.API_KEY,
          model: geminiConfig.MODEL,
        };
        break;
      default:
        console.warn(`Unknown assistant type: ${container.assistantType}`);
    }

    try {
      const token = await strapi.service('api::custom.rag-auth').getValidToken();
      const response = await strapi
        .service('api::custom.rag-api')
        .postRAGApi(
          configData,
          `/a/${container.name}/api/management/config/models`,
          token
        );

      if (response.status === 200) {
        await strapi.documents('api::container.container').update({
          documentId: container.documentId,
          data: {
            configured: true,
          },
        });

        return { success: true, container: container.name };
      } else {
        console.error('Error configuring container:', response.data);
        throw new Error(response.data);
      }
    } catch (error) {
      console.error('Error posting configuration data:', error);
      throw error;
    }
  },

  async processUnconfiguredContainers() {
    try {
      // Retrieve unconfigured containers
      const unconfiguredContainers = await this.getUnconfiguredContainers();

      // Track results of configuration attempts
      const results = await Promise.all(
        unconfiguredContainers.map(async container => {
          try {
            const result = await this.configureContainer(container);
            return { ...result, status: 'success' };
          } catch (error) {
            return {
              success: false,
              container: container.name,
              status: 'error',
              error: error.message,
            };
          }
        })
      );

      // Process agents for each container
      const agentResults = await Promise.all(
        unconfiguredContainers.map(async container => {
          try {
            // Get assistant information from the container
            const assistant = await strapi
              .documents('api::assistant.assistant')
              .findMany({
                filters: {
                  containerIds: {
                    documentId: container.documentId,
                  },
                },
                populate: {
                  provinceId: true,
                  serviceCategoryId: true,
                },
              });

            const assistantData = assistant[0];

            // Get the province and service category from the assistant
            const provinceCode = assistantData?.provinceId?.code || '';
            const serviceCategory = assistantData?.serviceCategoryId?.name || '';
            const instruction = assistantData?.metaData?.['instruction'] || '';

            const result = await strapi
              .service('api::custom.agent')
              .processAgent(
                container.name,
                provinceCode.toLowerCase(),
                serviceCategory.toLowerCase(),
                instruction
              );

            // Return a more detailed structure
            return {
              container: container.name,
              agentResponse: {
                status: result.agentResponse.status,
                data: result.agentResponse.data
              },
              s3Response: {
                status: result.s3Response.status,
                data: result.s3Response.data
              }
            };
          } catch (error) {
            strapi.log.error('Error processing agent for container:', error);
            return {
              container: container.name,
              success: false,
              status: 'error',
              error: error.message,
            };
          }
        })
      );

      return {
        success: true,
        processed: results,
        totalProcessed: results.length,
        agentResults: agentResults
      };
    } catch (error) {
      console.error('Error processing unconfigured containers:', error);
      throw error;
    }
  },
}));
