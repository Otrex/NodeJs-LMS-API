"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("courses", {
      uuid : {
        primaryKey : true,
        allowNull : false,
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV1,
      },
      title : Sequelize.STRING,
      subtitle : Sequelize.STRING,
      about : Sequelize.TEXT,
      requirements : Sequelize.JSON,
      learningOutcomes : Sequelize.JSON,
      skills : Sequelize.JSON,
      currency : {
        type : Sequelize.STRING,
        defaultValue : "NGN"
      },
      amount : Sequelize.FLOAT,
      welcomeMessage : Sequelize.TEXT,
      congratulatoryMessage : Sequelize.TEXT,
      status : {
        type : Sequelize.ENUM(["draft","review","live","disapproved"]),
        defaultValue : "draft"
      },
      adminFeedback : Sequelize.TEXT,
      featured : {
        type : Sequelize.BOOLEAN,
        defaultValue : false
      },
      creatorId : Sequelize.UUID,
      categoryId : Sequelize.UUID,

      createdAt : Sequelize.DATE,
      updatedAt : Sequelize.DATE,
      deletedAt : Sequelize.DATE
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("courses");
  }
};
