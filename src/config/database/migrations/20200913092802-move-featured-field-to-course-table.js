"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn("courseRevisions","featured"),
      queryInterface.addColumn("courses","featured",{
        type : Sequelize.BOOLEAN,
        defaultValue : false
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn("courses","featured"),
      queryInterface.addColumn("courseRevisions","featured",{
        type : Sequelize.BOOLEAN,
        defaultValue : false
      })
    ]);
  }
};
