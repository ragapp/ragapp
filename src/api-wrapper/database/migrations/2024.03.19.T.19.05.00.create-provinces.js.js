'use strict';

const provinces = [
  {
    name: 'Ontario',
    code: 'ON',
    externalId: '9',
  },
  {
    name: 'Quebec',
    code: 'QC',
    externalId: '13',
  },
  {
    name: 'Alberta',
    code: 'AB',
    externalId: '2',
  },
  {
    name: 'British Columbia',
    code: 'BC',
    externalId: '3',
  },
  {
    name: 'Manitoba',
    code: 'MB',
    externalId: '5',
  },
  {
    name: 'New Brunswick',
    code: 'NB',
    externalId: '1',
  },
  {
    name: 'Newfoundland and Labrador',
    code: 'NL',
    externalId: '6',
  },
  {
    name: 'Northwest Territories',
    code: 'NT',
    externalId: '7',
  },
  {
    name: 'Nova Scotia',
    code: 'NS',
    externalId: '4',
  },
  {
    name: 'Nunavut',
    code: 'NU',
    externalId: '8',
  },
  {
    name: 'Prince Edward Island',
    code: 'PE',
    externalId: '11',
  },
  {
    name: 'Saskatchewan',
    code: 'SK',
    externalId: '10',
  },
  {
    name: 'Yukon',
    code: 'YT',
    externalId: '12',
  },
];

module.exports = {
  async up(knex) {
    // Create entries using Strapi's document service
    for (const province of provinces) {
      await strapi.documents('api::province.province').create({
        data: province,
      });
    }
  },

  async down(knex) {
    // Delete all provinces
    const entries = await strapi.documents('api::province.province').findMany();
    for (const entry of entries) {
      await strapi.documents('api::province.province').delete({
        documentId: entry.documentId,
      });
    }
  },
};
