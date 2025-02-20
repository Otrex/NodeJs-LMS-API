'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('courseRevisions','slug',{
      type: Sequelize.STRING,
      unique: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('courseRevisions','slug',{
      type: Sequelize.STRING,
      unique: true
    });
  }
};
