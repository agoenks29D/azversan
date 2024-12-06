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
const { genSaltSync, hashSync } = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const userSalt = genSaltSync(10);
    /**
     * Bulk insert user
     * @type {UserAttributes[]}
     */
    const users = [
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

    await queryInterface.bulkInsert('users', users);
  },
  async down(queryInterface) {
    queryInterface.bulkDelete('users', null, {});
  },
};
