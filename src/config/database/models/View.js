
module.exports = (sequelize, DataTypes) => {
  const View = sequelize.define("view",{
    uuid : {
      primaryKey : true,
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1,
    },
    ip : DataTypes.STRING,
    courseId : DataTypes.UUID,

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

  View.associate = function(models){
    View.belongsTo(models.course, { foreignKey : "courseId" });
  };

  return View;
};