'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('media','userId'),
      queryInterface.removeColumn('media','lectureId'),
      queryInterface.removeColumn('media','sectionId'),
      queryInterface.removeColumn('media','courseRevisionId'),
      queryInterface.removeColumn('media','categoryId'),

      queryInterface.addColumn('users','imageId',{
        type: Sequelize.UUID
      }),
      queryInterface.addColumn('courseRevisions','imageId',{
        type: Sequelize.UUID
      }),
      queryInterface.addColumn('categories','iconId',{
        type: Sequelize.UUID
      })
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('media','userId',{
        type: Sequelize.UUID
      }),
      queryInterface.addColumn('media','lectureId',{
        type: Sequelize.UUID
      }),
      queryInterface.addColumn('media','sectionId',{
        type: Sequelize.UUID
      }),
      queryInterface.addColumn('media','courseRevisionId',{
        type: Sequelize.UUID
      }),
      queryInterface.addColumn('media','categoryId',{
        type: Sequelize.UUID
      }),

      queryInterface.removeColumn('users','imageId'),
      queryInterface.removeColumn('courseRevisions','imageId'),
      queryInterface.removeColumn('categories','iconId')
    ])
  }
};
