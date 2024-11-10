module.exports = () => ({
  async getAgents(containerName) {
    try {
      const token = await strapi.service('api::custom.rag-auth').getValidToken();
      const agents = await strapi
        .service('api::custom.rag-api')
        .getRAGApi(token, `/a/${containerName}/api/management/agents`);
      return agents.data;
    } catch (error) {
      console.error('Error getting agents:', error);
      strapi.log.error('Error getting agents:', error);
      throw error;
    }
  },

  /**
   * Updates or creates an agent in a container with specified configuration
   * @async
   * @function updateAgent
   * @param {string} containerName - The name of the container to update the agent in
   * @param {Object} agent - The agent object containing agent details
   * @param {string} agent.agent_id - The unique identifier for the agent
   * @param {string} instruction - The instruction/backstory to set for the agent
   * @returns {Promise<Object>} The response from the RAG API after updating the agent
   * @throws {Error} If there is an error updating the agent
   * @description
   * Creates a payload with agent configuration including:
   * - Basic agent properties (name, role, goal)
   * - Backstory from provided instruction
   * - Tool configurations (DuckDuckGo, ImageGenerator, etc)
   * - Only enables QueryEngine tool by default
   * Makes an authenticated POST request to update/create the agent and returns the response.
   */
  async updateAgent(containerName, agent, instruction) {
    try {
      const payload = {
        agent_id: agent.agent_id,
        name: 'Default',
        role: 'Assistant',
        goal: 'To help answer questions using the provided knowledge.',
        backstory: instruction,
        system_prompt: null,
        tools: {
          DuckDuckGo: {
            enabled: false,
            config: {},
          },
          ImageGenerator: {
            enabled: false,
            config: {
              api_key: '',
            },
          },
          Interpreter: {
            enabled: false,
            config: {
              api_key: null,
            },
          },
          OpenAPI: {
            enabled: false,
            config: {
              domain_headers: {},
              openapi_uri: null,
            },
          },
          QueryEngine: {
            enabled: true,
            config: {},
          },
          Wikipedia: {
            enabled: false,
            config: {},
          },
        },
        created_at: Math.floor(Date.now() / 1000),
      };

      const token = await strapi.service('api::custom.rag-auth').getValidToken();
      const response = await strapi
        .service('api::custom.rag-api')
        .putRAGApi(
          payload,
          `/a/${containerName}/api/management/agents`,
          token,
          agent.agent_id
        );
      return response;
    } catch (error) {
      strapi.log.error('Error updating agent:', error);
      throw error;
    }
  },

  async updateAgentS3Config(containerName, provinceCode, serviceCategory) {
    try {
      const token = await strapi.service('api::custom.rag-auth').getValidToken();

      const s3Config = await strapi
        .service('api::setting.setting')
        .getSetting('S3_CONFIG');

      const s3DataPath = await strapi
        .service('api::setting.setting')
        .getSetting('DATA_PATH');

      const payload = {
        s3_bucket: s3Config.bucket_name,
        s3_enabled: true,
        s3_path: `${s3DataPath.S3_BASE_PATH}/${provinceCode}/${serviceCategory
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')}`,
        s3_path_meta_files: s3DataPath.S3_META_FILES_PATH,
      };

      const response = await strapi
        .service('api::custom.rag-api')
        .putRAGApi(payload, `/a/${containerName}/api/management/config/s3`, token);
      return response;
    } catch (error) {
      strapi.log.error('Error updating agent S3 config:', error);
      throw error;
    }
  },

  async processAgent(containerName, provinceCode, serviceCategory, instruction) {
    try {
      // First get the list of agents for the container
      const agents = await this.getAgents(containerName);

      if (agents.length === 0) {
        throw new Error('No agents found in the container');
      }

      const agentItem = agents[0];

      // Destructure the responses
      const { status: agentStatus, data: agentData } = await this.updateAgent(
        containerName, 
        agentItem, 
        instruction
      );

      const { status: s3Status, data: s3Data } = await this.updateAgentS3Config(
        containerName,
        provinceCode,
        serviceCategory
      );

      // Return destructured data
      return {
        agentResponse: {
          status: agentStatus,
          ...agentData
        },
        s3Response: {
          status: s3Status,
          ...s3Data
        }
      };
    } catch (error) {
      strapi.log.error('Error processing agent:', error);
      throw error;
    }
  },
});
