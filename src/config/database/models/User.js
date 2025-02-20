

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user",{
    uuid : {
      primaryKey : true,
      allowNull : false,
      type : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV1,
    },
    firstName : DataTypes.STRING,
    lastName : DataTypes.STRING,
    email : DataTypes.STRING,
    password : DataTypes.STRING,
    about : DataTypes.TEXT,
    tagline : DataTypes.TEXT,
    profilePhoto : DataTypes.STRING,
    emailVerificationToken : DataTypes.STRING,
    accountRecoveryToken : DataTypes.STRING,
    emailVerified : {
      type : DataTypes.BOOLEAN,
      defaultValue : false
    },
    role : {
      type : DataTypes.ENUM(["user","admin","superadmin"]),
      defaultValue : "user"
    },
    bankName : DataTypes.STRING,
    bankAccountNumber : DataTypes.STRING,
    bankAccountName : DataTypes.STRING,
    bankCode : DataTypes.STRING,
    paystackRecipientCode : DataTypes.STRING,
    balance: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },

    schoolId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    dumoAccountId: {
      type: DataTypes.UUID
    },
    affiliateReferralCode: {
      type: DataTypes.STRING
    },

    createdAt : DataTypes.DATE,
    updatedAt : DataTypes.DATE,
    deletedAt : DataTypes.DATE
  },
  {
    paranoid : true,
    defaultScope : {
      attributes : {
        exclude : [
          "password","emailVerified","emailVerificationToken","accountRecoveryToken","role",
          "bankAccountName","bankName","bankAccountNumber","bankCode","paystackRecipientCode","balance"
        ]
      }
    },
    scopes : {
      withHiddenFields : {
        attributes : {}
      }
    },
    indexes: [
      {
        unique: true,
        fields: ["uuid"]
      }
    ]
  });

  User.associate = function(models){
    User.hasMany(models.course,{ foreignKey : "creatorId", as : "courses" });
    User.hasMany(models.order, { foreignKey : "userId" });
    User.hasMany(models.enrolment,{ foreignKey : "userId" });
    User.hasMany(models.transaction,{ foreignKey : "userId" });
    User.hasMany(models.transfer, { foreignKey : "userId" });
    User.belongsTo(models.media, { foreignKey: "imageId", as: "image" });
    User.hasMany(models.supportTicket, { foreignKey: "userId" });
    User.belongsTo(models.school, { foreignKey: "schoolId" });
  };

  return User;
};