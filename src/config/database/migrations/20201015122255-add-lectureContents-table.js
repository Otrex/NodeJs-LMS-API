'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable('lectureContents',{
      uuid: {
        primaryKey : true,
        allowNull : false,
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV1
      },
      type: {
        type: Sequelize.ENUM(["video","audio","file","text"])
      },
      content: {
        type: Sequelize.STRING
      },
      lectureId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      ref: {
        type: Sequelize.STRING,
        allowNull: false
      },

      createdAt : Sequelize.DATE,
      updatedAt : Sequelize.DATE,
      deletedAt : Sequelize.DATE
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('lectureContents');
  }
};
