"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn("users","bankName",{
        type : Sequelize.STRING
      }),
      queryInterface.addColumn("users","bankAccountNumber",{
        type : Sequelize.STRING
      }),
      queryInterface.addColumn("users","bankAccountName",{
        type : Sequelize.STRING
      }),
      queryInterface.addColumn("users","bankCode",{
        type : Sequelize.STRING
      }),
      queryInterface.addColumn("users","paystackRecipientCode",{
        type : Sequelize.STRING
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn("users","bankName"),
      queryInterface.removeColumn("users","bankAccountNumber"),
      queryInterface.removeColumn("users","bankAccountName"),
      queryInterface.removeColumn("users","bankCode"),
      queryInterface.removeColumn("users","paystackRecipientCode")
    ]);
  }
};
