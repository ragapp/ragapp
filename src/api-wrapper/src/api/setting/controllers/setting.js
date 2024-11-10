'use strict';

/**
 * setting controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::setting.setting');
