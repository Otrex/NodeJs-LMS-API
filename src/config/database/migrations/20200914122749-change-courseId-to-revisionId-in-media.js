"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("media","courseId","courseRevisionId");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("media","courseRevisionId","courseId");
  }
};
