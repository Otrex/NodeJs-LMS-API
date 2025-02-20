const { createSlug } = require("../../../utils");

module.exports = (sequelize, DataTypes) => {
  const DefaultCategory = sequelize.define("defaultCategory",{
    uuid : {
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1,
      primaryKey : true,
    },
    name: {
      type: DataTypes.STRING,
      set(value) {
        this.setDataValue("name", value);
        this.setDataValue("slug", createSlug(value));
      }
    },
    parentCategoryId : DataTypes.UUID,
    slug: {
      type: DataTypes.STRING,
      unique: true
    },
    iconId: {
      type: DataTypes.UUID
    },

    createdAt : DataTypes.DATE,
    updatedAt : DataTypes.DATE,
    deletedAt : DataTypes.DATE
  },
  {
    paranoid : true,
    defaultScope : {
      attributes : {
        exclude : ["createdAt","deletedAt","updatedAt"]
      }
    },
    indexes: [
      {
        unique: true,
        fields: ["uuid"]
      }
    ]
  });

  DefaultCategory.associate = function(models){
    DefaultCategory.belongsTo(DefaultCategory, { foreignKey : "parentCategoryId", as : "parentCategory" });
    DefaultCategory.subCategoryAssoc = DefaultCategory.hasMany(DefaultCategory, { foreignKey : "parentCategoryId", as : "subcategories" });
    DefaultCategory.mediaAssoc = DefaultCategory.belongsTo(models.media, { foreignKey : "iconId", as : "icon" });
  };

  return DefaultCategory;
};