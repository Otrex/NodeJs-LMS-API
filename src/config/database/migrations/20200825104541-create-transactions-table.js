"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("transactions", {
      uuid : {
        primaryKey : true,
        allowNull : false,
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV1,
      },
      paymentGateway : Sequelize.STRING,
      amount : Sequelize.FLOAT,
      status : {
        type : Sequelize.ENUM(["success","failed"])
      },
      paidAt : Sequelize.DATE,
      userId : Sequelize.UUID,
      courseId : Sequelize.UUID,

      createdAt : Sequelize.DATE,
      updatedAt : Sequelize.DATE,
      deletedAt : Sequelize.DATE
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("transactions");
  }
};
