const { Op } = require("sequelize");
const utils = require("../../../utils");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  const Section = sequelize.define("section",{
    uuid : {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    title: DataTypes.STRING,
    index: DataTypes.INTEGER,
    learningObjective: DataTypes.STRING,
    courseRevisionId: DataTypes.UUID,
    ref: DataTypes.STRING,

    createdAt : DataTypes.DATE,
    updatedAt : DataTypes.DATE,
    deletedAt : DataTypes.DATE
  },
  {
    hooks : {
      beforeCreate : (section, options) => {
        if(!section.ref){
          section.ref = uuidv4();
        }
        if(!section.index){
          return Section.max("index",{ where : { courseRevisionId : section.courseRevisionId } })
            .then(max => {
              if(!section.index){
                if(!max){
                  section.index = 1;
                } else {
                  section.index = max + 1;
                }
              }
            })
            .catch(err => {
              utils.writeToFile(`An error occurred setting index for section ${section} => ${err}`);
            });
        } else {
          return;
        }
      },
      afterDestroy: (section, options) => {
        return Section.decrement("index",{
          by : 1,
          where : { courseRevisionId : section.courseRevisionId, index : { [Op.gt] : section.index } }
        })
          .then((result) => {
            console.log("Section indexes changed => ",result);
          })
          .catch(err => {
            console.log(err);
            utils.writeToFile(`An error occurred changing section indexes [after delete] for section ${section.courseRevisionId} => ${err}`);
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

  Section.associate = function(models){
    Section.belongsTo(models.courseRevision, { foreignKey : "courseRevisionId" });
    Section.LectureAssoc = Section.hasMany(models.lecture,{ foreignKey : "sectionId" });
  };

  return Section;
};