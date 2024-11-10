'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios');

module.exports = createCoreController('api::assistant.assistant', ({ strapi }) => ({
  async create(ctx) {
    const { data } = ctx.request.body;
    const {
      primaryModel,
      secondaryModel,
      temperature,
      instruction,
      searchFile,
      description,
      provinceId,
      serviceCategoryId,
    } = data.metaData || {};

    // Validate required fields
    if (!provinceId || !serviceCategoryId) {
      return ctx.badRequest('Province and service category are required.');
    }

    // Check if instruction is provided and not empty
    if (!instruction || instruction.trim() === '') {
      return ctx.badRequest('Instruction is required.');
    }

    // Fetch province and service category
    const provinces = await strapi.documents('api::province.province').findMany({
      filters: { externalId: provinceId.toString() },
    });
    const province = provinces[0];
    const serviceCategories = await strapi
      .documents('api::service-category.service-category')
      .findMany({
        filters: { externalId: serviceCategoryId.toString() },
      });
    const serviceCategory = serviceCategories[0];

    if (!province || !serviceCategory) {
      return ctx.badRequest('Invalid province or service category.');
    }

    // Generate assistant name
    const assistantName = `${province.code.toLowerCase()}-${serviceCategory.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}`;

    // Check for duplicate assistant name
    const existingAssistant = await strapi
      .documents('api::assistant.assistant')
      .findMany({
        filters: { name: assistantName },
      });

    if (existingAssistant.length > 0) {
      return ctx.badRequest('Assistant name must be unique.');
    }

    let createdAssistant;
    try {
      // Get valid RAG token
      const token = await strapi.service('api::custom.rag-auth').getValidToken();

      // Check existing containers in RAG app
      const ragResponse = await strapi
        .service('api::custom.rag-api')
        .getRAGContainers(token);

      // Get allowed types from schema
      const allowedTypes =
        strapi.contentTypes['api::container.container'].attributes.assistantType.enum;
      const providers = allowedTypes;

      for (const provider of providers) {
        const containerName = `${assistantName}-${provider}`.toLowerCase();
        if (ragResponse.data.some(container => container.name === containerName)) {
          return ctx.badRequest(`Container ${containerName} already exists in RAG app.`);
        }
      }

      // Create assistant with generated name
      const assistantData = {
        ...data,
        name: assistantName,
        provinceId: province.id,
        serviceCategoryId: serviceCategory.id,
      };

      createdAssistant = await strapi.service('api::assistant.assistant').create({
        data: assistantData,
      });

      // Create containers
      const containers = await Promise.all(
        providers.map(provider =>
          strapi.documents('api::container.container').create({
            data: {
              name: `${assistantName}-${provider}`.toLowerCase(),
              assistantId: createdAssistant.id,
              assistantType: provider,
              configured: false,
              metaData: {
                primaryModel: primaryModel || '',
                secondaryModel: secondaryModel || '',
                temperature: temperature || '',
                instruction: instruction || '',
                searchFile: searchFile || '',
                description: description || '',
              },
            },
          })
        )
      );

      // Create containers in RAG app
      const s3Settings = await this.getS3Settings();
      const ragServicePayloads = providers.map(provider => ({
        name: `${assistantName}-${provider}`.toLowerCase(),
        connectToExternalData: true,
        ...s3Settings,
      }));

      const ragContainers = await Promise.all(
        ragServicePayloads.map(
          async payload =>
            await strapi
              .service('api::custom.rag-api')
              .postRAGApi(payload, '/manager/api/services', token)
        )
      );

      // Update containers with RAG metadata
      await Promise.all(
        containers.map((container, index) =>
          strapi.documents('api::container.container').update({
            documentId: container.id.toString(),
            data: {
              metaData: ragContainers[index].data,
            },
          })
        )
      );

      return createdAssistant;
    } catch (error) {
      // If any error occurs, cleanup any created resources
      if (createdAssistant?.data?.id) {
        await strapi
          .documents('api::assistant.assistant')
          .delete(createdAssistant.data.id);
      }

      console.error('Assistant creation error:', error);
      return ctx.badRequest(error.message || 'Failed to create assistant and containers');
    }
  },

  async getS3Settings() {
    const setting = await strapi.service('api::setting.setting').getSetting('S3_CONFIG');

    if (!setting) {
      throw new Error('S3 configuration not found in settings');
    }

    // Parse the value if it's a string
    const config = typeof setting === 'string' ? JSON.parse(setting) : setting;

    // Validate required fields
    const requiredFields = ['bucket_name', 'access_key', 'secret_key', 'url'];
    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`Missing required S3 setting: ${field}`);
      }
    }

    return {
      s3BucketName: config.bucket_name,
      s3AccessKey: config.access_key,
      s3SecretKey: config.secret_key,
      s3Url: config.url,
    };
  },
}));
