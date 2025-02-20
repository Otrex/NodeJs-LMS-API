"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn("transactions","amount"),
      queryInterface.removeColumn("transactions","courseId"),
      queryInterface.removeColumn("transactions","coursePricePercentage"),
      queryInterface.removeColumn("transactions","paidToInstructor"),

      queryInterface.createTable("transactionCourses",{
        uuid : {
          primaryKey : true,
          allowNull : false,
          type : Sequelize.UUID,
          defaultValue : Sequelize.UUIDV1,
        },
        amount: Sequelize.FLOAT,
        courseId: {
          type: Sequelize.UUID,
          allowNull: false
        },
        coursePricePercentage: {
          type : Sequelize.INTEGER,
          allowNull : false
        },
        transactionId: {
          type: Sequelize.UUID,
          allowNull: false
        },

        createdAt : Sequelize.DATE,
        updatedAt : Sequelize.DATE,
        deletedAt : Sequelize.DATE
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn("transactions", "amount",{
        type: Sequelize.FLOAT
      }),
      queryInterface.addColumn("transactions", "courseId",{
        type: Sequelize.UUID
      }),
      queryInterface.addColumn("transactions", "coursePricePercentage",{
        type: Sequelize.INTEGER,
        allowNull: false
      }),
      queryInterface.addColumn("transactions", "paidToInstructor", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }),

      queryInterface.dropTable("transactionCourses")
    ]);
  }
};
