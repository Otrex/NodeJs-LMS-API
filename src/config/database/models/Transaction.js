
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define("transaction",{
    uuid : {
      primaryKey : true,
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1
    },
    paymentGateway : DataTypes.STRING,
    status : {
      type : DataTypes.ENUM(["success","failed"])
    },
    paidAt : DataTypes.DATE,
    userId : DataTypes.UUID,
    reference: {
      type: DataTypes.STRING
    },
    cartId: {
      type: DataTypes.UUID
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    amount: {
      type: DataTypes.FLOAT
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

  Transaction.associate = function(models){
    Transaction.belongsTo(models.user, { foreignKey : "userId" });
    Transaction.hasMany(models.transactionCourse,{ foreignKey : "transactionId" });
    Transaction.belongsTo(models.cart, { foreignKey: "cartId" });
    Transaction.belongsTo(models.school, { foreignKey: "schoolId" });
  };

  return Transaction;
};