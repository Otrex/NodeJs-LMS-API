const {
  cart: Cart,
  cartItem: CartItem,
  course: Course,
  courseRevision: CourseRevision,
  enrolment: Enrolment,
  user: User,
  setting: Setting,
  transaction: Transaction,
  transactionCourse: TransactionCourse,
  schoolPaymentProvider: SchoolPaymentProvider,
  paymentProvider: PaymentProvider,
  couponSale: CouponSale,
  coupon: Coupon
} = require("../config/database/models");
const constants = require("../config/constants");
const utils = require("../utils");
const coupon = require("./coupon");

module.exports = {
  addCourseToCart: async(req, res, next) => {
    try {
      let { courseId } = req.params;
      let course = await Course.findOne({
        where: { uuid: courseId, schoolId: req.school.uuid },
        include: [{ model: CourseRevision,as: "activeCourseRevision",where: { status: "live" } }]
      });
      if(!course){
        return res.send({ success: false, message: "Course not found" });
      }

      let existingEnrolment = await Enrolment.findOne({
        where: { userId: req.user.uuid, courseId: course.uuid }
      });
      if(existingEnrolment){
        return res.status(403).send({ success: false, message: "You are already enrolled in this course" });
      }

      let [cart, cartCreated] = await Cart.findOrCreate({
        where: { userId: req.user.uuid, schoolId: req.school.uuid }
      });
      if(!cart){
        return res.status(500).send({ success: false, message: "Cart creation failed" });
      }

      let [cartItem, cartItemCreated] = await CartItem.findOrCreate({
        where: { cartId: cart.uuid, courseId: course.uuid }
      });
      if(!cartItem){
        return res.status(500).send({ success: false, message: "Cart item creation failed" });
      }

      return res.send({ success: true, message: "Course added to cart successfully" });
    } catch(e){
      next(e);
    }
  },
  getCart: async(req, res, next) => {
    try{
      let [cart, created] = await Cart.findOrCreate({
        where: { userId: req.user.uuid, schoolId: req.school.uuid },
        include: {
          model: CartItem,
          include: [{
            model: Course,
            include: constants.course.includes.list
          }]
        }
      });
      if(!cart){
        return next(e);
      }
      if(!cart.cartItems){
        cart.setDataValue("cartItems", []);
      }
      cart.cartItems = cart.getDataValue("cartItems").map((cartItem) => {
        cartItem.setDataValue("course", utils.mergeCourseRevisionData(cartItem.course));
        return cartItem;
      });
      return res.send({ success: true, message: "Cart retrieved successfully", data: cart });
    } catch(e){
      next(e);
    }
  },
  removeCourseFromCart: async(req, res, next) => {
    try {
      let { courseId } = req.params;
      let courseInCart = await CartItem.findOne({
        where: { courseId: courseId },
        include: [{ model: Cart, where: { userId: req.user.uuid, schoolId: req.school.uuid } }]
      });

      if(!courseInCart){
        return res.status(404).send({ success: false, message: "This course is not in your cart" });
      }

      let courseRemoved = await courseInCart.destroy();
      if(!courseRemoved){
        return res.status(500).send({ success: false, message: "Course removal failed" });
      }
      return res.send({ success: true, message: "Course removed from cart successfully" });
    } catch(e){
      next(e);
    }
  },
  buyCoursesInCart: async(req, res, next) => {
    let fieldsValid = utils.validateReqFields(req,res,["paymentProviderId"]);
    if(fieldsValid){
      try {
        let { paymentProviderId } = req.body;
        let paymentProvider = await SchoolPaymentProvider.findOne({
          where: {
            paymentProviderId,
            schoolId: req.school.uuid,
          },
          include: [{ model: PaymentProvider, required: true }]
        });

        if(!paymentProvider){
          return res.status(403).send({ success: false, message: "The provided payment gateway has not been set up for this school yet" });
        }
        // Check payment provider credentials
        let credentialsValid = utils.checkPaymentProviderCredentials(paymentProvider);
        if(!credentialsValid){
          return res.status(403).send({ success: false, message: "The credentials for the selected payment provider have not been provided by this school yet" });
        }

        let cart = await Cart.findOne({
          where: { userId: req.user.uuid, schoolId: req.school.uuid },
          include: {
            model: CartItem,
            include: [{
              model: Course,
              include: [{ model: CourseRevision,as: "activeCourseRevision",where: { status: "live" } }]
            }]
          }
        });

        if(!cart || !cart.cartItems.length){
          return res.send({ success: false, message: "You have no courses in your cart" });
        }
        
        let totalAmount;
        for (const cartItem of cart.cartItems) {
          if (!(cartItem.course.activeCourseRevision.free) && cartItem.course.activeCourseRevision.amount) {
            let { promoAmount, amount } = cartItem.course.activeCourseRevision;
            let amountToAdd = promoAmount ? promoAmount : amount;

            if (cartItem.couponId) {
              let foundCoupon = await Coupon.findOne({
                where: { uuid: couponId }
              });

              if (foundCoupon.discountType == "amount-off") {
                amountToAdd = amountToAdd - foundCoupon.discount;
              } else if (foundCoupon.discountType === "percent-off") {
                amountToAdd = amountToAdd - (foundCoupon.discount / 100 * amountToAdd);
              }
            }

            totalAmount += amountToAdd
          }
        } 
        let transaction = await Transaction.create({
          userId: req.user.uuid,
          cartId: cart.uuid,
          schoolId: req.school.uuid,
          paymentGateway: paymentProvider.paymentProvider.name,
          amount: totalAmount
        });

        if(!transaction){
          return res.status(500).send({ success: false, message: "Transaction creation failed" });
        }

        transaction.reference = `lms_${req.school.name.split(" ")[0].replace(/[^a-zA-Z0-9]/g,"")}_${transaction.uuid}`;
        transaction = await transaction.save();

        let transactionCourses = [];
        for(let cartItem of cart.cartItems){
          let { promoAmount, amount, free } = cartItem.course.activeCourseRevision;
          amount = promoAmount ? promoAmount : amount;
          //This is where we add ours
          let courseAmount = free ? 0 : amount;
        
          if (cartItem.couponId) {
            let { couponId } = cartItem.couponId;
            let foundCoupon = await Coupon.findOne({
              where: { uuid: couponId }
            });
            if (foundCoupon.discountType == "amount-off" && courseAmount != 0) {
              let courseAmount = courseAmount - foundCoupon.discount;
            } else if (foundCoupon.discountType === "percent-off" && courseAmount != 0) {
              let courseAmount = courseAmount - (foundCoupon.discount / 100 * courseAmount);
            }
          }

          transactionCourses.push({
            coursePricePercentage: 0,
            courseId: cartItem.courseId,
            amount: courseAmount,
            free: free,
            transactionId: transaction.uuid
          });
        }

        let transactionCoursesCreated = await TransactionCourse.bulkCreate(transactionCourses);
        console.log("Transaction courses created => ", transactionCoursesCreated);
        if (!transactionCoursesCreated) {
          return res.status(500).send({ success: false, message: "Transaction course record creation failed" });
        }
        // remove courses from cart ??
        return res.send({ success: true, message: "Transaction created successfully", data: transaction });
      } catch(e){
        next(e);
      }
    }
  }
};
