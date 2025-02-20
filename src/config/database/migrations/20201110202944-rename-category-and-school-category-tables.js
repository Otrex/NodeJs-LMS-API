'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.renameTable('categories','defaultCategories'),
      queryInterface.renameTable('schoolCategories', 'categories')
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.renameTable('defaultCategories','categories'),
      queryInterface.renameTable('categories', 'schoolCategories')
    ])
  }
};
