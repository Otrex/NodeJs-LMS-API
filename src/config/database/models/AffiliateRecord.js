module.exports = (sequelize, DataTypes) => {
    const AffiliateRecord = sequelize.define("affiliateRecord",{
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
      courseId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      clicks: {
        type: DataTypes.INTEGER,
        defaultValue: 0
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
  
    return AffiliateRecord;
  };
  