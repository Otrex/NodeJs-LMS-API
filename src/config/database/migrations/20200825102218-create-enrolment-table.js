"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("enrolments", {
      uuid : {
        primaryKey : true,
        allowNull : false,
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV1,
      },
      rating : {
        type : Sequelize.INTEGER,
        defaultValue : 0
      },
      review : Sequelize.TEXT,
      progress : Sequelize.INTEGER,
      userId : Sequelize.UUID,
      courseId : Sequelize.UUID,
      transactionId : Sequelize.UUID,

      createdAt : Sequelize.DATE,
      updatedAt : Sequelize.DATE,
      deletedAt : Sequelize.DATE
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("enrolments");
  }
};
