"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("lectures", {
      uuid : {
        primaryKey : true,
        allowNull : false,
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV1,
      },
      title : Sequelize.STRING,
      index : Sequelize.INTEGER,
      status : {
        type : Sequelize.ENUM(["draft","review","live","disapproved"]),
        defaultValue : "draft"
      },
      adminFeedback : Sequelize.TEXT,
      text : Sequelize.TEXT,
      sectionId : Sequelize.UUID,

      createdAt : Sequelize.DATE,
      updatedAt : Sequelize.DATE,
      deletedAt : Sequelize.DATE
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("lectures");
  }
};
