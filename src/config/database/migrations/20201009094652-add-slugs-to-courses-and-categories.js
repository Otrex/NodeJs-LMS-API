"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn("courseRevisions","slug",{
        type: Sequelize.STRING,
        unique: false
      }),
      queryInterface.addColumn("categories","slug",{
        type: Sequelize.STRING,
        unique: true
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn("courseRevisions","slug"),
      queryInterface.removeColumn("categories","slug")
    ]);
  }
};
