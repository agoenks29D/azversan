/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // add column
    await queryInterface.addColumn('auth_tokens', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // add constraint
    await queryInterface.addConstraint('auth_tokens', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_auth_tokens_user_id',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },
  async down(queryInterface) {
    // remove constraint
    await queryInterface.removeConstraint(
      'auth_tokens',
      'fk_auth_tokens_user_id',
    );

    // remove column
    await queryInterface.removeColumn('auth_tokens', 'user_id');
  },
};
