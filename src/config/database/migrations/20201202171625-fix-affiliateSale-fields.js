'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.renameColumn('affiliateSales','transactionCourseId','transactionId'),
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.renameColumn('affiliateSales','transactionId','transactionCourseId'),
    ])
  }
};
