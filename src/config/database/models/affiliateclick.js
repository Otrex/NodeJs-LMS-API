'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AffiliateClick extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  AffiliateClick.init({
    courseId: DataTypes.INTEGER,
    referralCode: DataTypes.STRING,
    clicks: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'AffiliateClick',
  });
  return AffiliateClick;
};