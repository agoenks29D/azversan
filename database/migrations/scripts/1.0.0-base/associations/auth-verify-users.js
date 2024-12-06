/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // add column
    await queryInterface.addColumn('auth_verify', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // add constraint
    await queryInterface.addConstraint('auth_verify', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_auth_verify_user_id',
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
      'auth_verify',
      'fk_auth_verify_user_id',
    );

    // remove column
    await queryInterface.removeColumn('auth_verify', 'user_id');
  },
};
