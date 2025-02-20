"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("media", {
      uuid : {
        primaryKey : true,
        allowNull : false,
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV1,
      },
      url : Sequelize.STRING,
      userId : Sequelize.UUID,
      lectureId : Sequelize.UUID,
      sectionId : Sequelize.UUID,
      courseId : Sequelize.UUID,
      categoryId : Sequelize.UUID,

      createdAt : Sequelize.DATE,
      updatedAt : Sequelize.DATE,
      deletedAt : Sequelize.DATE
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("media");
  }
};
