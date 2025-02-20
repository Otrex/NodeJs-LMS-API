"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn("courseRevisions","status",{
        type : Sequelize.ENUM(["draft","review","live","disapproved"]),
        defaultValue : "draft"
      }),
      queryInterface.removeColumn("courses", "status")
    ]);

  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn("courses","status",{
        type : Sequelize.ENUM(["draft","review","live","disapproved"]),
        defaultValue : "draft"
      }),
      queryInterface.removeColumn("courseRevisions", "status")
    ]);
  }
};
