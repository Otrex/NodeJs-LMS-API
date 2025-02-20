"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("enrolments","completedLectures", {
      type : Sequelize.JSON,
      defaultValue : []
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("enrolments","completedLectures");
  }
};
