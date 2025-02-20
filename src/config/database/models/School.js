
module.exports = (sequelize, DataTypes) => {
  const School = sequelize.define("school",{
    uuid : {
      primaryKey : true,
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1,
    },
    domainName: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
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
        fields: ["uuid","domainName"]
      }
    ]
  });

  School.associate = function(models){
    School.hasMany(models.course, { foreignKey: "schoolId" });
    School.hasMany(models.transaction, { foreignKey: "schoolId" });
    School.hasOne(models.setting, { foreignKey: "schoolId"});
    School.hasMany(models.user, { foreignKey: "schoolId" });
    School.hasMany(models.newsletterSubscriber, { foreignKey: "schoolId"});
    School.hasMany(models.schoolPaymentProvider, { foreignKey: "schoolId"});
    School.hasMany(models.supportTicket, { foreignKey: "schoolId" });
    School.hasMany(models.transfer, { foreignKey: "schoolId" });
    School.hasMany(models.enrolment, { foreignKey: "schoolId" });
    School.hasMany(models.schoolAdministrator, { foreignKey: "schoolId"});
    School.hasMany(models.cart, { foreignKey: "schoolId"});
  };

  return School;
};