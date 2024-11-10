'use strict';

/**
 * webhook-event controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::webhook-event.webhook-event', ({ strapi }) => ({
  async create(ctx) {
    console.log('Webhook Event Request Body:', ctx.request.body);
    
    // Call the default create action
    const response = await strapi.documents('api::webhook-event.webhook-event').create({
      data: {
        eventName: 'test',
        payload: ctx.request.body,
      },
    });
    
    return response;
  }
}));
