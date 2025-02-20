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
  school: School,
  courseRevision: CourseRevision,
  paymentProvider: PaymentProvider,
  schoolPaymentProvider: SchoolPaymentProvider,
  enrolment: Enrolment,
  setting: Setting,
  cart: Cart,
  affiliateSale: AffiliateSale,
  user: User,
  affiliateRecord: AffiliateRecord,
  coupon: Coupon,
  couponSale: CouponSale
} = require("../config/database/models");

module.exports = {
    getAllCoupons: async (req, res, next) => {
        let data = await Coupon.findAll({
            where: { schoolId: "35bb6370-51ac-11eb-b7ef-65611b5f12a0"},
            include:[{
              model: CouponSale,
            }]
          });
        res.send({ success: true, message: "Coupons retrieved", data });
    },
    getSpecificCoupon: async (req, res, next) => {
        let { couponId } = req.params;
        let data = await Coupon.find({
            where: {schoolId: req.school.uuid, uuid: couponId},
            include:[{
              model: CouponSale,
            }]
        });
        res.send({ success: true, message: "Coupon retrieved", data });
    },
    createCoupon: async (req, res, next) => {
        let { code,
            discountedCourseId,
            schoolId,
            description,
            discount,
            discountType,
            useLimit,
            expiryDate } = req.body

        let record = await Coupon.create({
            code,
            discountedCourseId,
            schoolId,
            description,
            discount,
            discountType,
            useLimit,
            expiryDate
        })

        res.send({ success: true, message: "Coupon created", record})
    },
    verifyCoupon: async (req, res, next) => {
        let { couponCode } = req.params;

        let foundCoupon = await Coupon.findOne({
            where: {code: couponCode},
        });

        if (!foundCoupon || foundCoupon.status == "inactive" || foundCoupon.uses > foundCoupon.useLimit) {
            res.status(404).send({
                success: "false",
                message: "Coupon does not exist"
            })
        }

        if (!foundCoupon.schoolId == req.school.uuid) {
            res.status(400).send({
                success: "false",
                message: "Coupon belongs to another school"
            })
        }

        if (foundCoupon) {
            res.send({
                status: "success",
                message: "Coupons returned",
                data: foundCoupon
            })
        }



        //check if it is for school
        //
    },
    recordCouponSale: async (req, res, next) => {
        let {couponId, transactionCourseId} = req.body;

        let foundCoupon = await Coupon.findOne({
             where: {uuid: couponId, discountedCourseId: transactionCourseId, status: "active"}
        });

        if (!foundCoupon) {
            res.send({success: false, message: "Invalid coupon"});
            return false
        }

        if (foundCoupon) {
            CouponSale.create({
                couponId,
                transactionCourseId
           })
               .then(couponSale => {
                   foundCoupon.uses += 1;
                   foundCoupon.save();
                   res.send({success: true, message: "Coupon Sale recorded", data: couponSale})
               })
               .catch(err => {
                   console.log(err);
                   next();
               })
        }

      
    },
    deleteCoupon: async (req, res, next) => {
        let { couponId } = req.params;
        Coupon.destroy({
            where: { uuid: couponId }
        }).then(result => {
            res.send({ status: success, message: "Coupon deleted", data: result})
        }).catch(err => {
            console.log(err);
            res.status(400).send({ status: failure, message: "Error", data: err})
        });
    },
    deactivateCoupon: async (req, res, next) => {
        let { couponCode } = req.body;

        let foundCoupon = await Coupon.findOne({
            where: {code: couponCode},
        });

        foundCoupon.status = "inactive";
        foundCoupon.save().then(foundCoupon => {
            res.send({status: "success", message: "Coupon de-activated", data: foundCoupon})
        }).catch(err => {
            console.log(err)
        })
    },
    activateCoupon: async (req, res, next) => {
        let { couponCode } = req.body;

        let foundCoupon = await Coupon.findOne({
            where: {code: couponCode},
        });

        foundCoupon.status = "active";
        foundCoupon.save().then(foundCoupon => {
            res.send({status: "success", message: "Coupon activated", data: foundCoupon})
        }).catch(err => {
            console.log(err)
        })
    }

};