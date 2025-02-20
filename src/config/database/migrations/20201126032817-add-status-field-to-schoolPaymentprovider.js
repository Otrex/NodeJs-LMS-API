'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('schoolPaymentProviders','status',{
      type: Sequelize.ENUM(['active','inactive']),
      defaultValue: 'inactive'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('schoolPaymentProviders','status');
  }
};
