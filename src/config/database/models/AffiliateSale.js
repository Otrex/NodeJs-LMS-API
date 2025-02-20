module.exports = (sequelize, DataTypes) => {
  const AffiliateSale = sequelize.define("affiliateSale",{
    uuid: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    referralCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    referralPercentage: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    transactionId: {
      type: DataTypes.UUID
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
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

  AffiliateSale.associate = function(models){
    AffiliateSale.belongsTo(models.transaction, { foreignKey: "transactionId" });
  };

  return AffiliateSale;
};
