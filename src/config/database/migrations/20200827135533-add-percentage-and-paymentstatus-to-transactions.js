"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn("transactions","coursePricePercentage", {
        type : Sequelize.INTEGER,
        allowNull : false
      }),
      queryInterface.addColumn("transactions","paidToInstructor", {
        type : Sequelize.BOOLEAN,
        allowNull : false,
        defaultValue : false
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn("transactions","coursePricePercentage"),
      queryInterface.removeColumn("transactions","paidToInstructor"),
    ]);
  }
};
