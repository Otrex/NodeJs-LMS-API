"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      uuid : {
        primaryKey : true,
        allowNull : false,
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV1,
      },
      firstName : Sequelize.STRING,
      lastName : Sequelize.STRING,
      email : Sequelize.STRING,
      password : Sequelize.STRING,
      about : Sequelize.TEXT,
      tagline : Sequelize.TEXT,
      profilePhoto : Sequelize.STRING,
      emailVerificationToken : Sequelize.STRING,
      accountRecoveryToken : Sequelize.STRING,
      emailVerified : {
        type : Sequelize.BOOLEAN,
        defaultValue : false
      },
      role : {
        type : Sequelize.ENUM(["user","admin","superadmin"]),
        defaultValue : "user"
      },
      createdAt : Sequelize.DATE,
      updatedAt : Sequelize.DATE,
      deletedAt : Sequelize.DATE
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("users");
  }
};
