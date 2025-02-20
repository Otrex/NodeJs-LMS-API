const utils = require("../utils");
const constants = require("../config/constants");
const { Op, QueryTypes } = require("sequelize");
const Sequelize = require("sequelize");
const models = require("../config/database/models");
const Mailer = require("../services/mailer");
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
  user: User,
  affiliateRecord: AffiliateRecord
} = require("../config/database/models");

module.exports = {
  recordClick: async (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["ref", "courseId"]);
    if (fieldsValid) {
      let { ref } = req.body;
      let { courseId } = req.body;

      let record;
      record = await AffiliateRecord.findOne({
        where: { referralCode: ref, courseId: courseId }
      });

      if (!record) {
        record = await AffiliateRecord.create({
          referralCode: ref,
          courseId: courseId
        })
      }

      AffiliateRecord.increment('clicks', { by: 1, where: { uuid: record.uuid } })
        .then(affiliateRecord => {
          res.send({ success: true, message: "Affiliate Record click updated" });
        })
        .catch(err => res.json(err));
    }
  },
  testAnalytics: async (req, res, next) => {
    try {
      const TODAY_START = new Date();
      TODAY_START.setHours(0, 0, 0);
      const NOW = new Date();

      let totalCourses = await Course.count({});
      let totalCoursesToday = await Course.count({
        where: { createdAt: { [Op.gt]: TODAY_START, [Op.lt]: NOW }}
      })

      let totalEnrolments = await Enrolment.count({});
      let totalEnrolmentsToday = await Enrolment.count({
        where: { createdAt: { [Op.gt]: TODAY_START, [Op.lt]: NOW } }
      });

      let eligibleTransactions = await Transaction.findAll({
        where: {schoolId: req.school.uuid}
      });
      let eligibleTransactionsToday = await Transaction.findAll({
        where: {schoolId: req.school.uuid, createdAt: {[Op.gt]: TODAY_START, [Op.lt]: NOW}}
      })
      let totalAmount = eligibleTransactions.reduce((prev, curr) => {
        return prev + curr.amount;
      }, 0);
      let totalAmountToday = eligibleTransactionsToday.reduce((prev, curr) => {
        return prev + curr.amount;
      }, 0);

      let data = {
        totalCourses,
        totalCoursesToday,
        totalEnrolments,
        totalEnrolmentsToday,
        totalAmount,
        totalAmountToday
      };

      res.send({ success: true, message: "Analytics retrieved", data });

    } catch (e) {
      next(e);
    }
  },


};