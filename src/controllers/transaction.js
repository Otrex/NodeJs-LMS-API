const crypto = require("crypto");
const utils = require("../utils");
const transactionService = require("../services/transaction");
const sequelize = require("sequelize");
const constants = require("../config/constants");
const {
  transaction: Transaction,
  transactionCourse: TransactionCourse,
  course: Course,
  courseRevision: CourseRevision,
  paymentProvider: PaymentProvider,
  schoolPaymentProvider: SchoolPaymentProvider,
  enrolment: Enrolment,
  setting: Setting,
  cart: Cart,
  affiliateSale: AffiliateSale,
  user: User
} = require("../config/database/models");

const Mailer = require("../services/mailer");

module.exports = {
  //todo: acadabay --- remove
  create: async (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["courseId", "paymentGateway"]);
    if (fieldsValid) {
      try {
        let { courseId, paymentGateway } = req.body;
        let course = await Course.findOne({
          where: { uuid: courseId },
          include: [{ model: CourseRevision, as: "activeCourseRevision", where: { status: "live" } }]
        });

        if (!course) {
          return res.send({ success: false, message: "Course not found" });
        }

        // let settings = await Setting.findOne({});
        // if(!settings){
        //   return next(e);
        // }
        // Get current course price % that goes to Acadabay
        // let { coursePricePercentage } = settings;

        let transaction = await Transaction.create({
          userId: req.user.uuid,
          paymentGateway
        });

        if (!transaction) {
          return res.status(500).send({ success: false, message: "Transaction creation failed" });
        }

        transaction.reference = `${transaction.uuid}_acadabay`;
        transaction = await transaction.save();

        let transactionCourse = await TransactionCourse.create({
          courseId,
          // coursePricePercentage,
          amount: course.activeCourseRevision.amount,
          transactionId: transaction.uuid
        });

        if (!transactionCourse) {
          return res.status(500).send({ success: false, message: "Transaction course record creation failed" });
        }
        return res.send({ success: true, message: "Transaction created successfully", data: transaction });
      } catch (e) {
        next(e);
      }
    }
  },
  verifyTransaction: async (req, res, next) => {
    try {
      let { transactionRef } = req.params;
      let { monnifyTransactionRef } = req.query;
      let { affiliateReferralCode } = req.query;
      let transactionCreated = await Transaction.findOne({
        where: { reference: transactionRef }
      });
      
      if (transactionCreated) {
        let transactionData = null;
        if (transactionCreated.amount <= 0) {
          transactionData = {
            paidAt: new Date().toISOString(),
            amount: 0
          };
        }

        if (transactionCreated.amount > 0 && transactionCreated.paymentGateway === "paystack") {
          transactionData = await transactionService.verifyPaystackTransaction(transactionRef, req.school.uuid);
        } else if (transactionCreated.amount > 0 && transactionCreated.paymentGateway == "monnify") {
          let rawTransactionData = await transactionService.verifyMonnifyTransaction(transactionRef, monnifyTransactionRef, req.school.uuid);
          transactionData = {
            amount: Number(rawTransactionData.amountPaid) * 100,
            paidAt: new Date(rawTransactionData.paidOn).toISOString()
          }
        }

        if (!transactionData) {
          return res.status(400).send({ success: false, message: "Transaction verification failed" });
        }

        let transaction = await Transaction.findOne({
          where: { reference: transactionRef },
          attributes: ["uuid", "reference", "userId", "status", "cartId"],
          include: [
            {
              model: TransactionCourse,
              include: [{
                model: Course,
                include: [{ model: CourseRevision, as: "activeCourseRevision", where: { status: "live" } }]
              }]
            },
            { model: Cart }
          ]
        });
        console.log("Transaction => ", transaction);

        if (!transaction) {
          return res.status(404).send({ success: false, message: "Transaction not found" });
        }

        Transaction.update({
          status: "success",
          paidAt: transactionData.paidAt
        }, {
          where: { reference: transactionRef }
        })
          .then(async (result) => {
            if (!result[0]) {
              return next(new Error("Transaction could not be updated"));
            }

            let enrolmentSuccessful = false;

            let totalAmount = transaction.transactionCourses.filter((transactionCourse) => {
              console.log(transaction.transactionCourses);
              return !(transactionCourse.course.activeCourseRevision.free) && transactionCourse.course.activeCourseRevision.amount;
            })
              .reduce((curr, next) => {
                let { promoAmount, amount } = next;
                let amountToAdd = promoAmount ? promoAmount : amount;

                return curr + amountToAdd;
              }, 0);

            console.log("Total amount! => ", totalAmount, transactionData.amount);

            if ((transactionData.amount / 100) < totalAmount) {
              return next(new Error("Transaction amount is less than calculated course amount"));
            }
            for (let transactionCourse of transaction.transactionCourses) {
              enrolmentSuccessful = await utils.enrolUserIntoCourse(transaction.userId, req.school.uuid, transactionCourse.courseId, transaction.uuid);
              const res = await Mailer.sendCourseEnrolmentMail({
                school: req.school,
                user: req.user,
                course: transactionCourse.course
              });
              console.log("Mail Res => ", res);
            }
            if (enrolmentSuccessful) {
              res.status(200).send({ success: true, message: "Enrolment successful" });

              if (transaction.cart) {
                transaction.cart.destroy();
              }

              // Affiliate sale
              if (affiliateReferralCode) {
                let { affiliateSalesStatus, affiliateSalesPercentage } = await Setting.findOne({ schoolId: req.school.uuid });
                if (affiliateSalesStatus === "active") {
                  await AffiliateSale.create({
                    referralCode: affiliateReferralCode,
                    referralPercentage: affiliateSalesPercentage,
                    transactionId: transaction.uuid,
                    schoolId: req.school.uuid
                  });

                  // send affiliate emails
                  const affiliateUser = await User.findOne({
                    where: {
                      affiliateReferralCode: affiliateReferralCode
                    }
                  });

                  if (affiliateUser) {
                    for (let transactionCourse of transaction.transactionCourses) {
                      const commissionAmount = (transactionCourse.amount * affiliateSalesPercentage) / 100;
                      await Mailer.sendAffiliateSalesMail({
                        user: affiliateUser,
                        school: req.school,
                        course: transactionCourse.course,
                        commissionAmount: commissionAmount
                      });
                    }
                    let transactionAffiliateRevenue = affiliateSalesPercentage * transactionData.amount / 100;
                    let updateAffiliateBalance = await User.increment('balance', { by: transactionAffiliateRevenue, where: { uuid: affiliateUser.uuid } });
                    if (!updateAffiliateBalance) {
                      return next(new Error("Affiliate User Balance could not be updated"));
                    }
                  }
                }
              }
              // Add to instructors' balances
              // for (let transactionCourse of transaction.transactionCourses) {
              //   let amountMade = transactionCourse.amount - ((transactionCourse.amount * transactionCourse.coursePricePercentage) / 100);
              //   let incrementResult = await User.update({ balance: sequelize.literal(`balance + ${amountMade}`) }, {
              //     where: { uuid: transactionCourse.course.creatorId }
              //   });
              //   console.log("Increment result => ", incrementResult);
              //   if (!incrementResult[0]) {
              //     utils.writeToFile(`Error incrementing instructors balance for => ${JSON.stringify(transactionCourse)}`);
              //   } else {
              //     console.log(`Instructors balance incremented successfully for transactionCourse ${JSON.stringify(transactionCourse)}`);
              //   }
              // }
            } else {
              res.status(500).send({ success: false, message: "An error occurred enrolling you into the course" });
            }
          })
          .catch(next);

      } else {
        return res.status(404).send({ success: false, message: "Transaction not found" });
      }
    } catch (e) {
      next(e);
    }
  },
  processPaystackEvent: (req, res, next) => {
    // Verify it's a paystack event
    let hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest("hex");
    if (hash === req.headers["x-paystack-signature"]) {
      let { event, data } = req.body;
      if (event === "charge.success") {
        let { reference, amount, currency, success } = data;
        // Find and update transaction, enroll user
        Transaction.findOne({ where: { reference: reference } })
          .then(transaction => {
            if (transaction) {
              Course.findOne({ where: { uuid: transaction.courseId } })
                .then(course => {
                  if (!course) {
                    return res.status(404).send({ status: "error", message: "Course not found" });
                  }
                  Transaction.update({
                    amount,
                    currency,
                    success
                  }, {
                    where: { reference: reference }
                  })
                    .then(result => {
                      if (!result[0]) {
                        return next(new Error("Transaction could not be updated"));
                      }
                      if ((transaction.amount >= (course.amount * 100)) && (transaction.currency >= course.currency)) {
                        utils.enrolUserIntoCourse(transaction.userId, course.uuid, transaction.uuid);
                        res.status(200);
                      } else {
                        next(new Error("Transaction amount/currency doesn't match course amount/currency"));
                      }
                    })
                    .catch(next);
                });
            } else {
              res.status(404).send({ status: "error", message: "Transaction not found" });
            }
          })
          .catch(next);
      } else {
        next(new Error("Paystack webhook event unrecognized"));
      }
    } else {
      return res.status(400).send({ status: "error", message: "Event verification failed" });
    }
  },
  getPaymentProviders: (req, res, next) => {
    SchoolPaymentProvider.findAll({
      where: {
        schoolId: req.school.uuid,
        status: "active"
      },
      include: [PaymentProvider]
    })
      .then(providers => {
        providers = providers.map((provider) => {
          if (provider.paymentProvider.name === "paystack") {
            let publicKey = JSON.parse(provider.credentials).publicKey;
            provider.setDataValue("publicKey", publicKey);
          }
          return provider;
        });
        return res.send({ success: true, message: "Payment providers retrieved successfully", data: providers });
      })
      .catch(next);
  }
};
