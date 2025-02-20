'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('lectures','courseRevisionId',{
        type: Sequelize.UUID
      }),
      queryInterface.addColumn('lectureContents','courseRevisionId',{
        type: Sequelize.UUID
      })
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('lectures','courseRevisionId'),
      queryInterface.removeColumn('lectureContents','courseRevisionId')
    ])
  }
};
