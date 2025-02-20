'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('lectureContents','index',{
      type: Sequelize.INTEGER
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('lectureContents','index',{
      type: Sequelize.INTEGER,
      allowNull: false
    })
  }

};
