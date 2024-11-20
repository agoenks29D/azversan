/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Test.
 *
 * @typedef {Object} TestAttributes
 * @property {string} name - Test name.
 * @property {string} value - Test value.
 * @property {Date} created_at - Created at.
 * @property {Date} updated_at - Updated at.
 */

const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    /**
     * Bulk insert test
     * @type {TestAttributes[]}
     */
    const tests = [...Array(100)].map(() => {
      return {
        name: faker.person.bio(),
        value: faker.lorem.word(),
        created_at: new Date(),
        updated_at: new Date(),
      };
    });

    await queryInterface.bulkInsert('test', tests);
  },
  async down(queryInterface) {
    queryInterface.bulkDelete('test', null, {});
  },
};
