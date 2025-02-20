"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("affiliateRecords", {
      uuid: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
      },
      referralCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      courseId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      clicks: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt : Sequelize.DATE,
      updatedAt : Sequelize.DATE,
      deletedAt : Sequelize.DATE
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("affiliateRecords");
  }
};
