module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define("coupon",{
    uuid: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    discountedCourseId: {
      type: DataTypes.UUID
    },
    schoolId: {
      type: DataTypes.UUID
    },
    description: {
      type: DataTypes.STRING
    },
    discount: {
      type: DataTypes.INTEGER
    },
    discountType: {
      type : DataTypes.ENUM(["percent-off","amount-off"]),
    },
    status: {
      type: DataTypes.ENUM(["active", "inactive"]),
      defaultValue: "active"
    },
    useLimit: {
      type: DataTypes.INTEGER
    },
    uses: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    expiryDate: {
      type: DataTypes.DATE
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

  Coupon.associate = function(models){
    Coupon.hasMany(models.couponSale, {foreignKey : "couponId"});
    Coupon.belongsTo(models.course, {foreignKey : "discountedCourseId"});
    Coupon.belongsTo(models.school, { foreignKey : "schoolId"})
  };

  return Coupon;
};
