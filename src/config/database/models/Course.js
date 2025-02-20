
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define("course",{
    uuid : {
      primaryKey : true,
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1,
    },
    featured : {
      type : DataTypes.BOOLEAN,
      defaultValue : false
    },
    creatorId: {
      type: DataTypes.UUID
    },
    activeCourseRevisionId: {
      type: DataTypes.UUID
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false
    },

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE
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

  Course.associate = function(models){
    Course.belongsTo(models.user, { foreignKey : "creatorId", as : "instructor" });
    Course.hasMany(models.order, { foreignKey : "courseId" });
    Course.hasMany(models.enrolment,{ foreignKey : "courseId" });
    // Course.hasMany(models.transaction,{ foreignKey : "courseId" });
    Course.hasMany(models.view, { foreignKey : "courseId" });
    Course.hasMany(models.courseRevision, { foreignKey: "courseId", as : "courseRevisions" });
    Course.belongsTo(models.school, { foreignKey: "schoolId" });

    Course.CourseRevisionAssoc = Course.belongsTo(models.courseRevision, { foreignKey: "activeCourseRevisionId", as: "activeCourseRevision" });
  };

  return Course;
};