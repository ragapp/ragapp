'use strict';

/**
 * rag-file service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::rag-file.rag-file');
