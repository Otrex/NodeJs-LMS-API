const { v4: uuidv4 } = require("uuid");
const utils = require("../../../utils");
const { Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const LectureContent = sequelize.define("lectureContent",{
    uuid: {
      primaryKey : true,
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1,
    },
    type: {
      type: DataTypes.ENUM(["video","audio","note","pdf"])
    },
    content: {
      type: DataTypes.TEXT
    },
    lectureId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    index: {
      type: DataTypes.INTEGER,
    },
    ref: {
      type: DataTypes.STRING,
    },
    courseRevisionId: DataTypes.UUID,
    name: {
      type: DataTypes.STRING
    },
    size: {
      // Size of file in Kilobytes
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    createdAt : DataTypes.DATE,
    updatedAt : DataTypes.DATE,
    deletedAt : DataTypes.DATE
  },
  {
    hooks: {
      beforeCreate: (lectureContent, options) => {
        if(!lectureContent.ref){
          lectureContent.ref = uuidv4();
        }
        if(!lectureContent.index){
          return LectureContent.max("index",{ where: { lectureId: lectureContent.lectureId } })
            .then(max => {
              if(!max){
                lectureContent.index = 1;
              } else {
                lectureContent.index = max + 1;
              }
            })
            .catch(err => {
              utils.writeToFile(`An error occurred setting index for lectureContent ${lectureContent} => ${err}`);
            });
        } else {
          return;
        }
      },
      afterDestroy: (lectureContent,options) => {
        return LectureContent.decrement("index",{
          by: 1,
          where: { lectureId: lectureContent.lectureId, index: { [Op.gt]: lectureContent.index } }
        })
          .then((result) => {
            console.log("lectureContent indexes changed => ",result);
          })
          .catch(err => {
            console.log(err);
            utils.writeToFile(`An error occurred changing lectureContent indexes [after delete] for lecture ${lectureContent.lectureId} => ${err}`);
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

  LectureContent.associate = function(models){
    LectureContent.belongsTo(models.lecture, { foreignKey : "lectureId" });
    LectureContent.belongsTo(models.courseRevision, { foreignKey: "courseRevisionId" });
  };

  return LectureContent;
};

