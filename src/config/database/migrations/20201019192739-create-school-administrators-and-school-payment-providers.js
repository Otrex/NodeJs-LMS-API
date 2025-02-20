'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.createTable('schoolAdministrators',{
        uuid : {
          primaryKey : true,
          allowNull : false,
          type : Sequelize.UUID,
          defaultValue : Sequelize.UUIDV1,
        },
        dumoAccountId: {
          type: Sequelize.UUID,
          allowNull: false
        },
        schoolId: {
          type: Sequelize.UUID,
          allowNull: false
        },
        role: {
          type: Sequelize.ENUM(["owner", "admin"]),
          allowNull: false
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
        deletedAt: Sequelize.DATE
      }),

      queryInterface.removeColumn('paymentProviders','publicKey'),
      queryInterface.removeColumn('paymentProviders','secretKey'),
      queryInterface.removeColumn('paymentProviders','schoolId'),

      queryInterface.createTable('schoolPaymentProviders',{
        uuid : {
          primaryKey : true,
          allowNull : false,
          type : Sequelize.UUID,
          defaultValue : Sequelize.UUIDV1,
        },
        schoolId: {
          type: Sequelize.UUID,
          allowNull: false
        },
        paymentProviderId: {
          type: Sequelize.UUID,
          allowNull: false
        },
        credentials: {
          type: Sequelize.JSON
        },

        createdAt : Sequelize.DATE,
        updatedAt : Sequelize.DATE,
        deletedAt : Sequelize.DATE
      }),

      queryInterface.removeColumn('schools','dumoAccountUserId'),

      queryInterface.addColumn('users','dumoAccountId',{
        type: Sequelize.UUID
      })

   ])
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.dropTable('schoolAdministrators'),

      queryInterface.addColumn('paymentProviders','publicKey',{
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('paymentProviders','secretKey',{
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('paymentProviders','schoolId',{
        type: Sequelize.UUID,
        allowNull: false
      }),

      queryInterface.dropTable('schoolPaymentProviders'),

      queryInterface.addColumn('schools','dumoAccountUserId',{
        type: DataTypes.UUID
      }),

      queryInterface.removeColumn('users','dumoAccountId')

    ])
  }
};
