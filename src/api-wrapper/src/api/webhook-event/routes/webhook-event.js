'use strict';

/**
 * webhook-event router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::webhook-event.webhook-event');
