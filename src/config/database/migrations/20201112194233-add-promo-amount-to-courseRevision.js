'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('courseRevisions','promoAmount',{
      type: Sequelize.FLOAT
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('courseRevisions','promoAmount')
  }
};
