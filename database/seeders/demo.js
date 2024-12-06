/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * User.
 *
 * @typedef {Object} UserAttributes
 * @property {string} email - User email.
 * @property {string} username - User username.
 * @property {string} password - User password.
 * @property {boolean} is_admin - User is admin.
 * @property {'male' | 'female'} gender - User gender.
 * @property {string} full_name - User full name.
 * @property {string} photo_profile - User photo profile.
 * @property {Date} created_at - Created at.
 * @property {Date} updated_at - Updated at.
 * @property {Date | null} deleted_at - Deleted at.
 */

require('dotenv/config');
const { faker } = require('@faker-js/faker');
const { genSaltSync, hashSync } = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const userSalt = genSaltSync(10);
    /**
     * Bulk insert user
     * @type {UserAttributes[]}
     */
    const defaultUsers = [
      {
        email: 'admin@demo.com',
        username: 'admin',
        is_admin: true,
        password: hashSync('admin', userSalt),
        full_name: 'Administrator',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'member@demo.com',
        username: 'member',
        is_admin: false,
        password: hashSync('password', userSalt),
        full_name: 'Member',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    /**
     * Bulk insert user
     * @type {UserAttributes[]}
     */
    const users = defaultUsers.concat(
      [...Array(98)].map(() => {
        const sexType = faker.person.sexType();
        const firstName = faker.person.firstName(sexType);
        const lastName = faker.person.lastName(sexType);
        const fullName = `${firstName} ${lastName}`;
        const email = faker.internet
          .email({ firstName, lastName })
          .toLowerCase();
        const username = faker.internet
          .username({ firstName, lastName })
          .substring(0, 30) // username max length is 30
          .toLowerCase();
        const password = hashSync('password', userSalt);
        const photo_profile = faker.image.url();

        return {
          email,
          username,
          password,
          is_admin: false,
          gender: sexType,
          full_name: fullName,
          photo_profile,
          created_at: faker.date.between({
            from: `${new Date().getFullYear()}-01-01`,
            to: new Date(),
          }),
          updated_at: new Date(),
        };
      }),
    );

    await queryInterface.bulkInsert('users', users);
  },
  async down(queryInterface) {
    queryInterface.bulkDelete('users', null, {});
  },
};
