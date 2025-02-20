module.exports = (sequelize, DataTypes) => {
  const CouponSale = sequelize.define("couponSale",{
    uuid: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    couponId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    transactionCourseId: {
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

  CouponSale.associate = function(models){
    CouponSale.belongsTo(models.coupon, {foreignKey : "couponId"});
    CouponSale.belongsTo(models.transactionCourse, {foreignKey : "transactionCourseId"})
  };

  return CouponSale;
};
