"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("cartItems","couponId",{
      type : Sequelize.UUID
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("cartItems","couponId");
  }
};
