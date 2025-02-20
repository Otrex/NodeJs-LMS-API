'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('affiliateSales',{
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
      referralPercentage: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      // TransactionCourse model uuid
      transactionCourseId: {
        type: Sequelize.UUID
      },

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      deletedAt: Sequelize.DATE,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('affiliateSales');
  }
};
