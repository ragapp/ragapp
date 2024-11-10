'use strict';

/**
 * assistant service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::assistant.assistant');
