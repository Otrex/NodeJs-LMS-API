"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("transactions","cartId", {
      type: Sequelize.UUID
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("transactions","cartId");
  }
};
