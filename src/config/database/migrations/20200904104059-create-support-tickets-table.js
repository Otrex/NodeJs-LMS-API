"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("supportTickets", {
      uuid : {
        primaryKey : true,
        allowNull : false,
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV1,
      },
      subject: {
        type: Sequelize.STRING,
      },
      message: {
        type: Sequelize.TEXT
      },
      email: {
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.UUID
      },
      adminId: {
        type: Sequelize.UUID
      },
      adminReply: {
        type: Sequelize.TEXT
      },

      createdAt : Sequelize.DATE,
      updatedAt : Sequelize.DATE,
      deletedAt : Sequelize.DATE
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("supportTickets");
  }
};
