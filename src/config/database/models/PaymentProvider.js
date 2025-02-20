

module.exports = (sequelize, DataTypes) => {
  const PaymentProvider = sequelize.define("paymentProvider",{
    uuid : {
      primaryKey : true,
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1,
    },
    name: {
      type : DataTypes.STRING,
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
        fields: ["uuid","name"]
      }
    ]
  });

  // PaymentProvider.associate = function(models){

  // }

  return PaymentProvider;
};