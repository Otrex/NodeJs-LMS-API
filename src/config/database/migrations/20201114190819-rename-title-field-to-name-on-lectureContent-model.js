'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('lectureContents','title','name');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('lectureContents','name','title');
  }
};
