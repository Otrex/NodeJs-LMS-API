
module.exports = (sequelize, DataTypes) => {
  const Transfer = sequelize.define("transfer",{
    uuid : {
      primaryKey : true,
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1,
    },
    userId: DataTypes.UUID,
    amount: DataTypes.FLOAT,
    status : {
      type : DataTypes.ENUM(["success","failed"])
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false
    },
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

  Transfer.associate = function(models){
    Transfer.belongsTo(models.user, { foreignKey : "userId" });
    Transfer.belongsTo(models.school, { foreignKey: "schoolId" });

  };

  return Transfer;
};


