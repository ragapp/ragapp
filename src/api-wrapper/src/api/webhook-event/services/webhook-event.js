'use strict';

/**
 * webhook-event service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::webhook-event.webhook-event');
