'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('lectureContents','content',{
      type: Sequelize.TEXT
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('lectureContents','content',{
      type: Sequelize.STRING,
      allowNull: false
    })
  }

};
