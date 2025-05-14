'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'publicKey', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'publicKey');
  }
}; 