"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn("sections","ref",{
        type: Sequelize.STRING,
        allowNull: false
      }),
      queryInterface.addColumn("lectures","ref",{
        type: Sequelize.STRING,
        allowNull: false
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn("sections","ref"),
      queryInterface.removeColumn("lectures","ref")
    ]);
  }
};
