'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('settings','affiliateSalesPercentage',{
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('settings','affiliateSalesStatus',{
        type: Sequelize.ENUM(['active','inactive']),
        defaultValue: 'inactive'
      })
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('settings','affiliateSalesPercentage'),
      queryInterface.removeColumn('settings','affiliateSalesStatus'),
    ])
  }
};
