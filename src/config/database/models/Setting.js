module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define("setting",{
    uuid : {
      primaryKey : true,
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    coursePricePercentage: DataTypes.INTEGER,

    affiliateSalesPercentage: {
      type: DataTypes.INTEGER
    },
    affiliateSalesStatus: {
      type: DataTypes.ENUM(['active','inactive']),
      defaultValue: 'inactive'
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

  Setting.associate = function(models){
    Setting.belongsTo(models.school, { foreignKey: "schoolId" });
  }

  return Setting;
};


