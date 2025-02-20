
module.exports = (sequelize, DataTypes) => {
  const Enrolment = sequelize.define("enrolment",{
    uuid : {
      primaryKey : true,
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1,
    },
    rating : {
      type : DataTypes.INTEGER,
      defaultValue : 0
    },
    review : DataTypes.TEXT,
    progress : DataTypes.INTEGER,
    userId : DataTypes.UUID,
    courseId : DataTypes.UUID,
    transactionId : DataTypes.UUID,
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false
    },

    createdAt : DataTypes.DATE,
    updatedAt : DataTypes.DATE,
    deletedAt : DataTypes.DATE,
    completedLectures : {
      type : DataTypes.JSON,
      defaultValue : []
    }
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

  Enrolment.associate = function(models){
    Enrolment.belongsTo(models.user,{ foreignKey : "userId" });
    Enrolment.belongsTo(models.course, { foreignKey : "courseId" });
    Enrolment.belongsTo(models.transaction, { foreignKey : "transactionId" });
    Enrolment.belongsTo(models.school, { foreignKey: "schoolId" });
  };

  return Enrolment;
};


