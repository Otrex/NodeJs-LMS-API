'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('schoolCategories', {
      uuid: {
        allowNull : false,
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV1,
        primaryKey : true,
      },
      name: {
        type: Sequelize.STRING,
      },
      parentCategoryId : Sequelize.UUID,
      slug: {
        type: Sequelize.STRING,
        unique: true
      },
      iconId: {
        type: Sequelize.UUID
      },
      schoolId: {
        type: Sequelize.UUID
      },

      createdAt : Sequelize.DATE,
      updatedAt : Sequelize.DATE,
      deletedAt : Sequelize.DATE
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('schoolCategories');
  }
};
