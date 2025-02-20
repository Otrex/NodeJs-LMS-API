
module.exports = (sequelize, DataTypes) => {

  const Order = sequelize.define("order",{
    uuid : {
      primaryKey : true,
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1,
    },
    userId : DataTypes.UUID,
    courseId : DataTypes.UUID,

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

  Order.associate = function(models){
    Order.belongsTo(models.user, { foreignKey : "userId" });
    Order.belongsTo(models.course, { foreignKey : "courseId" });
  };

  return Order;
};