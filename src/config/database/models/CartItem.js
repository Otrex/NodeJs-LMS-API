module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define("cartItem",{
    uuid: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    cartId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false
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

  CartItem.associate = function(models){
    CartItem.belongsTo(models.cart, { foreignKey: "cartId" });
    CartItem.belongsTo(models.course, { foreignKey: "courseId" });

  };

  return CartItem;
};