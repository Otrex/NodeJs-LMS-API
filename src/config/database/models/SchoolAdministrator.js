
module.exports = (sequelize, DataTypes) => {
  const SchoolAdministrator = sequelize.define("schoolAdministrator",{
    uuid : {
      primaryKey : true,
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1,
    },
    dumoAccountId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM(["owner", "admin"]),
      allowNull: false
    },

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE
  },
  {
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["uuid"]
      }
    ]
  });

  SchoolAdministrator.associate = function(models){
    SchoolAdministrator.belongsTo(models.school, { foreignKey: "schoolId"});
  };

  return SchoolAdministrator;
};