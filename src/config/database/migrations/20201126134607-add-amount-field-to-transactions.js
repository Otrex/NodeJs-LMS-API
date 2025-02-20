'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('transactions','amount', {
      type: Sequelize.FLOAT
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('transactions','amount');
  }
};
