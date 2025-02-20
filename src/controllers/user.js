const utils = require("../utils");
const constants = require("../config/constants");
const authService = require("../services/auth");
const transactionService = require("../services/transaction");
const Mailer = require("../services/mailer");

const {
  user: User,
  media: Media,
  newsLetterSubscriber: NewsletterSubscriber,
  supportTicket: SupportTicket,
  affiliateSale: AffiliateSale,
  transaction: Transaction,
  transactionCourse: TransactionCourse,
  course: Course
} = require("../config/database/models");

let protectedUserFields = ["email", "password", "role"];

module.exports = {
  register: async (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["firstName", "lastName", "email", "password"]);
    if (fieldsValid) {
      let { firstName, lastName, email, password } = req.body;
      let user = await User.count({ where: { email, schoolId: req.school.uuid } });
      if (!user) {
        try {
          password = await utils.hashPassword(password);
          let emailVerificationToken = utils.generateToken();

          let createdUser = await User.create({
            email,
            password,
            firstName,
            lastName,
            emailVerificationToken,
            schoolId: req.school.uuid,
            affiliateReferralCode: utils.createReferralCode()
          });

          if (!createdUser) {
            return next(new Error("User creation failed"));
          }
          // await utils.sendEmailVerificationMail(email, emailVerificationToken);
          await Mailer.sendSchoolUserRegisteredMail({
            school: req.school,
            user: createdUser
          });

          let authToken = utils.signAuthToken({ userId: createdUser.uuid, schoolId: req.school.uuid });
          return res.status(201).send({
            success: true,
            message: "Account created successfully",
            data: { account: createdUser, token: authToken }
          });

        } catch (e) {
          next(e);
        }
      } else {
        res.status(409).send({ success: false, message: `A user with email ${email} already exists` });
      }
    }
  },
  login: (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["email", "password"]);

    if (fieldsValid) {
      let { email, password } = req.body;
      User.scope("withHiddenFields").findOne({
        where: { email, schoolId: req.school.uuid },
        include: [{ model: Media, as: "image" }]
      })
        .then(async (user) => {
          if (!user) {
            return res.status(404).send({
              success: false,
              message: "An account with the provided email does not exist"
            });
          }
          let passwordsMatch = await utils.comparePasswords(password, user.password);
          if (passwordsMatch) {
            let authToken = utils.signAuthToken({ userId: user.uuid, schoolId: req.school.uuid });
            // user.token = authToken;

            // set affiliateReferralCode for users created prior to affiliates feature
            if (!user.affiliateReferralCode) {
              user.affiliateReferralCode = utils.createReferralCode();
              await user.save();
            }
            return res.send({ success: true, message: "Login successful", data: { account: user, token: authToken } });
          } else {
            return res.status(400).send({ success: false, message: "Incorrect password" });
          }
        })
        .catch(next);
    }
  },
  signInWithGoogle: async (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["authCode"]);
    if (fieldsValid) {
      let { authCode } = req.query;
      let userProfile = await authService.google.getProfile(authCode);
      if (userProfile) {
        console.log(userProfile);
        let { email, given_name, family_name } = userProfile;
        User.findOne({
          where: { email },
          include: [{ model: Media, as: "image" }]
        })
          .then(user => {
            if (!user) {
              // New user signup and login
              let newUserData = {
                email,
                firstName: given_name ? given_name : "Google user",
                lastName: family_name ? family_name : "",
                emailVerified: true
              };
              User.create({ ...newUserData })
                .then(createdUser => {
                  let authToken = utils.signAuthToken({ userId: createdUser.uuid });
                  res.status(201).send({
                    success: true,
                    message: "Account created successfully",
                    data: { ...createdUser.get(), token: authToken }
                  });
                })
                .catch(next);
            } else {
              // Existing user login
              let authToken = utils.signAuthToken({ userId: user.uuid });
              res.send({ success: true, message: "Login successful", data: { ...user.get(), token: authToken } });
            }
          })
          .catch(next);
      } else {
        return res.status(500).send({ success: false, message: "Google sign in failed" });
      }
    }
  },
  signInWithFacebook: async (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["authCode"]);
    if (fieldsValid) {
      let { authCode } = req.query;
      let userProfile = await authService.facebook.getProfile(authCode);
      console.log(userProfile);
      if (userProfile && userProfile.email) {
        console.log(userProfile);
        let { email, first_name, last_name } = userProfile;
        User.findOne({
          where: { email },
          include: [{ model: Media, as: "image" }]
        })
          .then(user => {
            if (!user) {
              // New user signup and login
              let newUserData = {
                email,
                firstName: first_name ? first_name : "Facebook user",
                lastName: last_name ? last_name : "",
                emailVerified: true
              };
              User.create({ ...newUserData })
                .then(createdUser => {
                  let authToken = utils.signAuthToken({ userId: createdUser.uuid });
                  res.status(201).send({
                    success: true,
                    message: "Account created successfully",
                    data: { ...createdUser.get(), token: authToken }
                  });
                })
                .catch(next);
            } else {
              // Existing user login
              let authToken = utils.signAuthToken({ userId: user.uuid });
              res.send({ success: true, message: "Login successful", data: { ...user.get(), token: authToken } });
            }
          })
          .catch(next);
      } else {
        return res.status(500).send({ success: false, message: "Facebook sign in failed" });
      }
    }
  },
  getProfile: async (req, res, next) => {
    try {
      const user = await User.findOne({
        where: { uuid: req.user.uuid, schoolId: req.school.uuid },
        include: constants.user.includes
      });
      if (!user) {
        return res.status(404).send({ success: false, message: "User not found" });
      }
      if (user.uuid !== req.user.uuid) {
        return res.status(401).send({ success: false, message: "You can't update a different users' profile" });
      }
      let response = {
        success: true,
        data: user
      };
      return res.send(response);
    } catch (e) {
      next(e);
    }
  },
  updateProfile: (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res);

    if (fieldsValid) {
      User.findOne({
        where: { uuid: req.user.uuid, schoolId: req.school.uuid },
        include: constants.user.includes
      })
        .then(async (user) => {
          if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
          }
          if (user.uuid !== req.user.uuid) {
            return res.status(401).send({ success: false, message: "You can't update a different users' profile" });
          }
          // Prevent email/password update on this endpoint
          for (let field in req.body) {
            if (protectedUserFields.indexOf(field) == -1) {
              user[field] = req.body[field];
            }
          }

          let objectRef;
          if (req.image) {
            objectRef = utils.spaces.createObjectReference("profile-photos");

            let media = await Media.create({
              url: objectRef
            });

            media && user.setImage(media.uuid);
            // .then(media => {
            //   user.setImage(media.uuid);
            //   console.log(`Created media => ${media.get()}`);
            // })
            // .catch(next);
          }
          user.save()
            .then(updatedUser => {
              let response = { success: true, message: "User profile updated", data: updatedUser };
              if (objectRef) {
                response.uploadUrl = objectRef;
              }
              return res.send(response);
            })
            .catch(next);
        })
        .catch(next);
    }
  },
  updateAccount: async (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["password"]);
    if (fieldsValid) {
      User.scope("withHiddenFields").findOne({
        where:
          { uuid: req.user.uuid, schoolId: req.school.uuid },
        include: constants.user.includes
      })
        .then(async (user) => {
          if (user) {
            let { password, newEmail, newPassword } = req.body;
            let passwordsMatch = await utils.comparePasswords(password, user.password);
            if (passwordsMatch) {
              if (newEmail) {
                let existingUserWithEmail = await User.count({ where: { email: newEmail } });
                if (!existingUserWithEmail) {
                  user.email = newEmail;
                  user.emailVerified = false;
                  user.emailVerificationToken = utils.generateToken();
                } else {
                  return res.status(409).send({
                    success: false,
                    message: `A user with email ${newEmail} already exists`
                  });
                }
              }
              if (newPassword) {
                user.password = await utils.hashPassword(newPassword);
              }
              user.save()
                .then(updatedUser => {
                  res.send({ success: true, message: "User account updated", data: updatedUser });

                  if (newEmail && (updatedUser.email == newEmail)) {
                    utils.sendEmailVerificationMail(newEmail, updatedUser.emailVerificationToken);
                  }
                })
                .catch(next);
            } else {
              return res.status(400).send({ success: false, message: "Incorrect password" });
            }
          } else {
            return res.status(404).send({ success: false, message: "User account not found" });
          }
        })
        .catch(next);
    }
  },
  forgotPassword: (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["email"]);
    if (fieldsValid) {
      let { email } = req.body;
      User.findOne({ where: { email, schoolId: req.school.uuid } })
        .then(user => {
          if (user) {
            user.accountRecoveryToken = utils.generateToken();
            user.save()
              .then(() => {
                res.send({ success: true, message: "An account recovery mail has been sent to your mail" });
                utils.sendPasswordResetMail(email, user.accountRecoveryToken, req.school);
              })
              .catch(next);
          } else {
            return res.status(404).send({
              success: false,
              message: `An account with the provided email ${email} does not exist`
            });
          }
        })
        .catch(next);
    }
  },
  resetPassword: (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["password"]);
    if (fieldsValid) {
      let { token } = req.params;
      let { password } = req.body;
      User.findOne({ where: { accountRecoveryToken: token, schoolId: req.school.uuid } })
        .then(async (user) => {
          if (user) {
            user.password = await utils.hashPassword(password);
            user.accountRecoveryToken = null;
            user.save()
              .then(() => {
                return res.send({ success: true, message: "Your password has been reset successfully" });
              })
              .catch(next);
          } else {
            return res.status(404).send({ success: false, message: "User not found" });
          }
        })
        .catch(next);
    }
  },
  verifyEmail: (req, res, next) => {
    let { token } = req.params;
    User.findOne({ where: { emailVerificationToken: token, schoolId: req.school.uuid } })
      .then(user => {
        if (user) {
          user.emailVerified = true;
          user.save()
            .then(() => {
              return res.send({ success: true, message: "Email verified successfully" });
            })
            .catch(next);
        } else {
          return res.status(404).send({ success: false, message: "User not found" });
        }
      })
      .catch(next);
  },
  subscribeToNewsletter: async (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["email"]);
    if (fieldsValid) {
      try {
        let newsLetterSubscriber = await NewsletterSubscriber.findOrCreate({ where: { email: req.body.email } });
        if (!newsLetterSubscriber) {
          return res.send({ success: false, message: "Subscription failed" });
        }
        return res.send({ success: true, message: "Newsletter subscription successful" });
      } catch (e) {
        next(e);
      }
    }
  },
  confirmBankAccount: async (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["bankAccountNumber", "bankCode"]);
    if (fieldsValid) {
      let { bankAccountNumber, bankCode } = req.query;
      let accountDetails = await transactionService.resolveAccountNumber(bankAccountNumber, bankCode);
      if (!accountDetails) {
        return res.status(404).send({ success: false, message: "Account number could not be confirmed" });
      }
      let data = {
        bankAccountName: accountDetails.account_name,
        bankAccountNumber: accountDetails.account_number
      };
      res.send({ success: true, message: "Account number verified", data });
    }
  },
  updateBankDetails: async (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["bankName", "bankAccountNumber", "bankAccountName", "bankCode"]);
    if (fieldsValid) {
      let { bankName, bankAccountNumber, bankAccountName, bankCode } = req.body;
      let accountDetails = await transactionService.resolveAccountNumber(bankAccountNumber, bankCode);
      if (!accountDetails) {
        return res.status(404).send({ success: false, message: "Account number could not be confirmed" });
      }

      // // create paystack recipient
      // let createdPaystackRecipient = await transactionService.createPaystackTransferRecipient(bankAccountName, bankAccountNumber, bankCode);
      // if (!createdPaystackRecipient) {
      //   return res.status(500).send({ success: false, message: "An error occurred adding your account details" });
      // }

      User.update({
        // paystackRecipientCode: createdPaystackRecipient.recipient_code,
        bankName,
        bankAccountName,
        bankAccountNumber,
        bankCode
      }, { where: { uuid: req.user.uuid } })
        .then(() => {
          res.send({ success: true, message: "Account details saved successfully" });
        })
        .catch(next);
    }
  },
  getBanks: async (req, res, next) => {
    try {
      let banks = await transactionService.getBanks(req.school.uuid);
      if (!banks) {
        return res.status(500).send({ success: false, message: "Banks could not retrieved at this time" });
      }
      return res.send({ success: true, message: "Banks retrieved", data: banks });
    } catch (e) {
      next(e);
    }
  },
  getBankDetails: async (req, res, next) => {
    try {
      let user = await User.scope("withHiddenFields").findOne({
        where: { uuid: req.user.uuid },
        attributes: ["bankCode", "bankName", "bankAccountName", "bankAccountNumber"]
      });
      if (!user) {
        return res.status(404).send({ success: false, message: "User not found" });
      }
      res.send({ success: true, message: "Bank details retrieved", data: user });
    } catch (e) {
      next(e);
    }
  },
  getAffiliateEarnings: async (req, res, next) => {
    try {
      let user = await User.scope("withHiddenFields").findOne({
        where: { uuid: req.user.uuid }
      });
      const sales = await AffiliateSale.findAll({
        where: {
          referralCode: user.affiliateReferralCode
        },
        include: [
          {
            model: Transaction,
            include: [
              {
                model: TransactionCourse,
                include : [
                  {
                    model : Course,
                    attributes : ["uuid","createdAt"],
                    include : constants.course.includes.list
                  }
                ]
              }
            ]
          }
        ]
      });
      if (!user) {
        return res.status(404).send({ success: false, message: "User not found" });
      }
      res.send({ success: true, message: "Sales retrieved", data: sales });
    } catch (e) {
      next(e);
    }
  }
};


