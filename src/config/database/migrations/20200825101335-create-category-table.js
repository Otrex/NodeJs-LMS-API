"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("categories",{
      uuid : {
        allowNull : false,
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV1,
        primaryKey : true,
      },
      name : Sequelize.STRING,
      parentCategoryId : Sequelize.UUID,

      createdAt : Sequelize.DATE,
      updatedAt : Sequelize.DATE,
      deletedAt : Sequelize.DATE
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("categories");
  }
};
