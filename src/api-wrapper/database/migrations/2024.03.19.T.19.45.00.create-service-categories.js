'use strict';

const serviceCategories = require('../data/service-categories');

module.exports = {
  async up(knex) {
    // Create entries using Strapi's document service
    for (const category of serviceCategories) {
      await strapi.documents('api::service-category.service-category').create({
        data: {
          name: category.name,
          externalId: category.externalId.toString(),
        },
      });
    }
  },

  async down(knex) {
    // Delete all service categories
    const entries = await strapi
      .documents('api::service-category.service-category')
      .findMany();
    for (const entry of entries) {
      await strapi.documents('api::service-category.service-category').delete({
        documentId: entry.documentId,
      });
    }
  },
};
