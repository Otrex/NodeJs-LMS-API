'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('lectureContents','type',{
        type: Sequelize.ENUM(["video","audio","note","pdf"])
      }),
      queryInterface.changeColumn('lectureContents','ref',{
        type: Sequelize.STRING
      })
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('lectureContents','type',{
        type: Sequelize.ENUM(["video","audio","file","text"])
      }),
      queryInterface.changeColumn('lectureContents','ref',{
        type: Sequelize.STRING,
        alloNull: false
      })
    ])
  }
};
