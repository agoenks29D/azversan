/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'auth_verify',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          type: Sequelize.INTEGER,
        },
        code: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        token: Sequelize.STRING,
        purpose: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        code_is_used: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        token_is_used: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        expires_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      },
    );
  },
  async down(queryInterface) {
    await queryInterface.dropTable('auth_verify');
  },
};
