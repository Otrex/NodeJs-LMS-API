'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('lectures','adminFeedback'),
      queryInterface.removeColumn('lectures','text'),
      queryInterface.removeColumn('sections','adminFeedback')
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('lectures','adminFeedback',{
        type: Sequelize.TEXT
      }),
      queryInterface.addColumn('lectures','text',{
        type: Sequelize.TEXT
      }),
      queryInterface.addColumn('sections','adminFeedback',{
        type: Sequelize.TEXT
      })
    ])
  }
};
