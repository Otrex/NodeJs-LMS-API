"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn("sections","status"),
      queryInterface.removeColumn("lectures","status"),
      queryInterface.renameColumn("sections","courseId","courseRevisionId")
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn("sections","status",{
        type : Sequelize.ENUM(["draft","review","live","disapproved"]),
        defaultValue : "draft"
      }),
      queryInterface.addColumn("lectures","status",{
        type : Sequelize.ENUM(["draft","review","live","disapproved"]),
        defaultValue : "draft"
      }),
      queryInterface.renameColumn("sections","courseRevisionId","courseId")
    ]);
  }
};
