'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('lectureContents','size',{
      type: Sequelize.FLOAT,
      defaultValue: 0
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('lectureContents','size',{
      type: Sequelize.FLOAT
    })
  }
};
