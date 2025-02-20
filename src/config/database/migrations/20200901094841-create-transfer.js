"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("transfers", {
      uuid : {
        primaryKey : true,
        allowNull : false,
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV1,
      },
      userId: Sequelize.UUID,
      amount: Sequelize.FLOAT,
      status : {
        type : Sequelize.ENUM(["success","failed"])
      },

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      deletedAt : Sequelize.DATE
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("transfers");
  }
};