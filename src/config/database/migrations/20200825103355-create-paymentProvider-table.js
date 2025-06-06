"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("paymentProviders", {
      uuid : {
        primaryKey : true,
        allowNull : false,
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV1,
      },
      name : {
        type : Sequelize.STRING,
      },
      publicKey : Sequelize.STRING,
      secretKey : Sequelize.STRING,

      createdAt : Sequelize.DATE,
      updatedAt : Sequelize.DATE,
      deletedAt : Sequelize.DATE
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("paymentProviders");
  }
};
