'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.createTable('schools', {
        uuid : {
          primaryKey : true,
          allowNull : false,
          type : Sequelize.UUID,
          defaultValue : Sequelize.UUIDV1,
        },
        dumoAccountUserId: {
          type: Sequelize.UUID,
          allowNull: false
        },
        domainName: {
          type: Sequelize.STRING
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
        deletedAt: Sequelize.DATE
      }),
      queryInterface.addColumn('courses','schoolId',{
        type: Sequelize.UUID,
        allowNull: false
      }),
      queryInterface.addColumn('transactions','schoolId',{
        type: Sequelize.UUID,
        allowNull: false
      }),
      queryInterface.addColumn('transfers','schoolId',{
        type: Sequelize.UUID,
        allowNull: false
      }),
      queryInterface.addColumn('users','schoolId',{
        type: Sequelize.UUID,
        allowNull: false
      }),
      queryInterface.addColumn('settings','schoolId',{
        type: Sequelize.UUID,
        allowNull: false
      }),
      queryInterface.addColumn('newsletterSubscribers','schoolId',{
        type: Sequelize.UUID,
        allowNull: false
      }),
      queryInterface.addColumn('paymentProviders','schoolId',{
        type: Sequelize.UUID,
        allowNull: false
      }),
      queryInterface.addColumn('supportTickets','schoolId',{
        type: Sequelize.UUID,
        allowNull: false
      }),
      queryInterface.addColumn('enrolments','schoolId',{
        type: Sequelize.UUID,
        allowNull: false
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.dropTable('schools'),
      queryInterface.removeColumn('courses','schoolId'),
      queryInterface.removeColumn('transactions','schoolId'),
      queryInterface.removeColumn('transfers','schoolId'),
      queryInterface.removeColumn('users','schoolId'),
      queryInterface.removeColumn('settings','schoolId'),
      queryInterface.removeColumn('newsletterSubscribers','schoolId'),
      queryInterface.removeColumn('paymentProviders','schoolId'),
      queryInterface.removeColumn('supportTickets','schoolId'),
      queryInterface.removeColumn('enrolments','schoolId')
    ]);
  }
};
