

module.exports = (sequelize, DataTypes) => {
  const SchoolPaymentProvider = sequelize.define("schoolPaymentProvider",{
    uuid : {
      primaryKey : true,
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    paymentProviderId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    credentials: {
      type: DataTypes.JSON
    },
    status: {
      type: DataTypes.ENUM(['active','inactive']),
      defaultValue: 'inactive'
    },

    createdAt : DataTypes.DATE,
    updatedAt : DataTypes.DATE,
    deletedAt : DataTypes.DATE
  },
  {
    paranoid : true,
    indexes: [
      {
        unique: true,
        fields: ["uuid"]
      }
    ]
  });

  SchoolPaymentProvider.associate = function(models){
    SchoolPaymentProvider.belongsTo(models.school, { foreignKey: "schoolId" });
    SchoolPaymentProvider.belongsTo(models.paymentProvider, { foreignKey: "paymentProviderId"});
  }

  return SchoolPaymentProvider;
};