/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('node:fs');
const path = require('node:path');

const migrationScript = '1.0.0-base';

/** @type {import('sequelize-cli').Migration[]} */
const migrationTables = fs
  .readdirSync(`${__dirname}/scripts/${migrationScript}/tables`)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 &&
      file !== path.basename(__filename) &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1,
  )
  .map((migrationFile) => {
    const file = require(
      path.join(__dirname, `/scripts/${migrationScript}/tables`, migrationFile),
    );

    return file;
  });

/** @type {import('sequelize-cli').Migration[]} */
const migrationAssociations = fs
  .readdirSync(`${__dirname}/scripts/${migrationScript}/associations`)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 &&
      file !== path.basename(__filename) &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1,
  )
  .map((migrationFile) => {
    const file = require(
      path.join(
        __dirname,
        `/scripts/${migrationScript}/associations`,
        migrationFile,
      ),
    );

    return file;
  });

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // tables
    await Promise.all(
      migrationTables.map((migration) =>
        migration.up(queryInterface, Sequelize),
      ),
    );
    // associations
    await Promise.all(
      migrationAssociations.map((migration) =>
        migration.up(queryInterface, Sequelize),
      ),
    );
  },
  async down(queryInterface, Sequelize) {
    // associations
    await Promise.all(
      migrationAssociations.map((migration) =>
        migration.down(queryInterface, Sequelize),
      ),
    );
    // tables
    await Promise.all(
      migrationTables.map((migration) =>
        migration.down(queryInterface, Sequelize),
      ),
    );
  },
};
