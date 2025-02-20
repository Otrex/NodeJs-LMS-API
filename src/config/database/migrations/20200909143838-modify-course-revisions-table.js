"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn("courseRevisions","courseId",{
        type: Sequelize.UUID
      }),

      queryInterface.removeColumn("courseRevisions","creatorId"),
      queryInterface.removeColumn("courseRevisions","status")
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn("courseRevisions","courseId"),

      queryInterface.addColumn("courseRevisions","creatorId",{
        type: Sequelize.UUID
      }),
      queryInterface.addColumn("courseRevisions","status",{
        type : Sequelize.ENUM(["draft","review","live","disapproved"]),
        defaultValue : "draft"
      })
    ]);
  }
};
