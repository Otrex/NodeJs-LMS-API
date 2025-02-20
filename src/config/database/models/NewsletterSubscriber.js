
module.exports = (sequelize, DataTypes) => {
  const NewsletterSubscriber = sequelize.define("newsletterSubscriber",{
    uuid : {
      primaryKey : true,
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1,
    },
    email : {
      type : DataTypes.STRING,
      unique : true
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false
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

  NewsletterSubscriber.associate = function(models){
    NewsletterSubscriber.belongsTo(models.school, { foreignKey: "schoolId" });
  }

  return NewsletterSubscriber;
};