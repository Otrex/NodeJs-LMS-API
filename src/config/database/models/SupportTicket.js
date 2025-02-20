
module.exports = (sequelize, DataTypes) => {
  const SupportTicket = sequelize.define("supportTicket",{
    uuid : {
      primaryKey : true,
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1,
    },
    subject: {
      type: DataTypes.STRING,
    },
    message: {
      type: DataTypes.TEXT
    },
    email: {
      type: DataTypes.STRING
    },
    userId: {
      type: DataTypes.UUID
    },
    adminId: {
      type: DataTypes.UUID
    },
    adminReply: {
      type: DataTypes.TEXT
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

  SupportTicket.associate = function(models){
    SupportTicket.belongsTo(models.user, { foreignKey: "userId", as: "user" });
    SupportTicket.belongsTo(models.user, { foreignKey: "adminId", as: "admin" });
    SupportTicket.belongsTo(models.school, { foreignKey: "schoolId" });
  };

  return SupportTicket;
};