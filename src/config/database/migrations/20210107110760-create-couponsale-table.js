"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("couponSales", {
      uuid: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
      },
      couponId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      transactionCourseId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      createdAt : Sequelize.DATE,
      updatedAt : Sequelize.DATE,
      deletedAt : Sequelize.DATE
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("coupons");
  }
};
