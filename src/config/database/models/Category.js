const { createSlug } = require("../../../utils");

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define("category",{
    uuid: {
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
    schoolId: {
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

  Category.associate = function(models){
    Category.belongsTo(Category, { foreignKey: "parentCategoryId", as : "parentCategory" });
    Category.hasMany(Category, { foreignKey: "parentCategoryId", as : "subcategories" });
    Category.belongsTo(models.media, { foreignKey: "iconId", as : "icon" });
  };

  return Category;
};