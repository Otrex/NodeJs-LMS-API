module.exports = (sequelize, DataTypes) => {
  const CourseRevision = sequelize.define("courseRevision",{
    uuid: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    title: {
      type: DataTypes.STRING
    },
    subtitle: DataTypes.STRING,
    about: DataTypes.TEXT,
    requirements: DataTypes.JSON,
    learningOutcomes: DataTypes.JSON,
    skills: DataTypes.JSON,
    currency: {
      type: DataTypes.STRING,
      defaultValue: "NGN"
    },
    amount : DataTypes.FLOAT,
    promoAmount: DataTypes.FLOAT,
    free: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    welcomeMessage : DataTypes.TEXT,
    congratulatoryMessage : DataTypes.TEXT,
    adminFeedback : DataTypes.TEXT,
    categoryId : DataTypes.UUID,
    status : {
      type : DataTypes.ENUM(["draft","review","live","disapproved"]),
      defaultValue : "draft"
    },
    slug: {
      type: DataTypes.STRING
    },
    imageId: {
      type: DataTypes.UUID
    },

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
    courseId: DataTypes.UUID
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

  CourseRevision.associate = function(models){
    CourseRevision.MediaAssoc = CourseRevision.belongsTo(models.media, { foreignKey: "imageId", as : "image" });
    CourseRevision.SectionAssoc = CourseRevision.hasMany(models.section,{ foreignKey: "courseRevisionId" });
    CourseRevision.LectureAssoc = CourseRevision.hasMany(models.lecture, { foreignKey: "courseRevisionId" });
    CourseRevision.LectureContentAssoc = CourseRevision.hasMany(models.lectureContent, { foreignKey: "courseRevisionId"});
    CourseRevision.belongsTo(models.course, { foreignKey: "courseId" });
    CourseRevision.CategoryAssoc = CourseRevision.belongsTo(models.category, { foreignKey : "categoryId" });
  };

  return CourseRevision;
};