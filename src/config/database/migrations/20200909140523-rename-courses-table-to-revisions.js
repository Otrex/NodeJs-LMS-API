"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.renameTable("courses","courseRevisions")
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.renameTable("courseRevisions","courses")
    ]);
  }
};
