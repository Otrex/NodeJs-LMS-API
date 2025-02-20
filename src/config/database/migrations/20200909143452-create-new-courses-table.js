"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("courses",{
      uuid : {
        primaryKey : true,
        allowNull : false,
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV1,
      },
      status : {
        type : Sequelize.ENUM(["draft","review","live","disapproved"]),
        defaultValue : "draft"
      },
      creatorId: {
        type: Sequelize.UUID,
      },
      activeCourseRevisionId: {
        type: Sequelize.UUID,
      },

      createdAt : Sequelize.DATE,
      updatedAt : Sequelize.DATE,
      deletedAt : Sequelize.DATE
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("courses");
  }
};
