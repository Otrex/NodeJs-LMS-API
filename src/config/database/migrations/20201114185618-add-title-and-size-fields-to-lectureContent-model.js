'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('lectureContents','title', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('lectureContents','size', {
        type: Sequelize.FLOAT
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('lectureContents','title'),
      queryInterface.removeColumn('lectureContents','size')
    ])
  }
};
