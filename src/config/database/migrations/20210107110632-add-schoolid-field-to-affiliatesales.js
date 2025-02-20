"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("affiliateSales","schoolId",{
      type : Sequelize.UUID
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("affiliateSales","schoolId");
  }
};
