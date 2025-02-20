const { Op } = require("sequelize");
const utils = require("../../../utils");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  const Lecture = sequelize.define("lecture",{
    uuid : {
      primaryKey : true,
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1,
    },
    title : DataTypes.STRING,
    index : DataTypes.INTEGER,
    sectionId : DataTypes.UUID,
    ref: DataTypes.STRING,
    courseRevisionId: DataTypes.UUID,

    createdAt : DataTypes.DATE,
    updatedAt : DataTypes.DATE,
    deletedAt : DataTypes.DATE
  },
  {
    hooks : {
      beforeCreate : (lecture, options) => {
        if(!lecture.ref){
          lecture.ref = uuidv4();
        }
        if(!lecture.index){
          return Lecture.max("index",{ where: { sectionId: lecture.sectionId } })
            .then(max => {
              if(!max){
                lecture.index = 1;
              } else {
                lecture.index = max + 1;
              }
            })
            .catch(err => {
              utils.writeToFile(`An error occurred setting index for lecture ${lecture} => ${err}`);
            });
        } else {
          return;
        }
      },
      afterDestroy: (lecture,options) => {
        return Lecture.decrement("index",{
          by: 1,
          where: { sectionId: lecture.sectionId, index: { [Op.gt]: lecture.index } }
        })
          .then((result) => {
            console.log("Lecture indexes changed => ",result);
          })
          .catch(err => {
            console.log(err);
            utils.writeToFile(`An error occurred changing lecture indexes [after delete] for section ${lecture.sectionId} => ${err}`);
          });
      }
    },
    paranoid : true,
    indexes: [
      {
        unique: true,
        fields: ["uuid"]
      }
    ]
  });

  Lecture.associate = function(models){
    Lecture.belongsTo(models.courseRevision, { foreignKey : "courseRevisionId" });
    Lecture.belongsTo(models.section, { foreignKey : "sectionId" });
    Lecture.LectureContentAssoc = Lecture.hasMany(models.lectureContent, { foreignKey: "lectureId"});
  };

  return Lecture;
};

