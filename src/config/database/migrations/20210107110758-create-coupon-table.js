"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("coupons", {
      uuid: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      discountedCourseId: {
        type: Sequelize.UUID
      },
      schoolId: {
        type: Sequelize.UUID
      },
      description: {
        type: Sequelize.STRING
      },
      discount: {
        type: Sequelize.INTEGER
      },
      discountType: {
        type : Sequelize.ENUM(["percent-off","amount-off"]),
      },
      status: {
        type: Sequelize.ENUM(["active", "inactive"]),
        defaultValue: "inactive"
      },
      useLimit: {
        type: Sequelize.INTEGER
      },
      uses: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      expiryDate: {
        type: Sequelize.DATE
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
