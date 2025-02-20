
module.exports = (sequelize, DataTypes) => {
  const TransactionCourse = sequelize.define("transactionCourse",{
    uuid : {
      primaryKey : true,
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1,
    },
    amount : DataTypes.FLOAT,
    free: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    courseId : {
      type: DataTypes.UUID,
      allowNull: false
    },
    coursePricePercentage: {
      type : DataTypes.INTEGER,
      allowNull : false
    },
    transactionId: {
      type: DataTypes.UUID,
      allowNull: false
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

  TransactionCourse.associate = function(models){
    TransactionCourse.belongsTo(models.transaction, { foreignKey : "transactionId" });
    TransactionCourse.belongsTo(models.course,{ foreignKey : "courseId" });
  };

  return TransactionCourse;
};