module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define("cart",{
    uuid: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    schoolId: {
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

  Cart.associate = function(models){
    Cart.belongsTo(models.user, { foreignKey: "userId" });
    Cart.hasMany(models.cartItem, { foreignKey: "cartId" });
  };

  return Cart;
};