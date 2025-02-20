const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const constants = require("../config/constants");
const utils = require("../utils");
const {
  course:Course,
  courseRevision: CourseRevison,
  enrolment:Enrolment,
  user:User,
  transaction:Transaction
} = require("../config/database/models");

module.exports = {
  getCourses : (req,res,next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["page"]);
    if(fieldsValid){
      let { page, limit } = req.query;
      limit = limit ? Number(limit) : 20;

      Course.findAndCountAll({
        where : { creatorId: req.user.uuid },
        attributes: constants.course.attributes.instructor,
        include: constants.course.includes.instructorList,
        ...utils.paginate({ page, limit })
      })
        .then(courses => {
          let pages = Math.ceil(courses.count / limit);

          courses.rows = courses.rows.map((course) => {
            course = utils.setInstructorRevision(course);
            return utils.mergeCourseRevisionData(course);
          });
          res.send({ success: true, message: "Courses retrieved", data: courses.rows, count : courses.count, pages });
        })
        .catch(next);
    }
  },
  submitForReview : async(req,res,next) => {
    let { courseId } = req.params;
    let courseToSubmit = await Course.findOne({
      where: { uuid: courseId },
      include: [{
        model: CourseRevison,
        as: "courseRevisions",
        where: { status: { [Op.or]: [constants.status.draft, constants.status.disapproved] } },
        required: true
      }]
    });

    if(!courseToSubmit){
      return res.status(404).send({ success: false, message: "This course is neither in draft or disapproved and so cannot be submitted for review" });
    }

    let courseRevisionToSubmit = courseToSubmit.courseRevisions[0];
    // console.log('Course to submit => ', courseToSubmit);

    courseRevisionToSubmit.status = constants.status.review;
    courseRevisionToSubmit.save()
      .then(() => {
        return res.send({ success: true, message: "Course submitted for review successfully" });
      })
      .catch(next);

  },
  getCourse: (req,res,next) => {
    let { courseId } = req.params;
    Course.findOne({
      where: { uuid : courseId, creatorId : req.user.uuid },
      attributes: constants.course.attributes.instructor,
      include: constants.course.includes.instructor,
      order: constants.course.courseRevisions
    })
      .then(course => {
        if(course){
          course = utils.setInstructorRevision(course);
          course = utils.mergeCourseRevisionData(course);
          return res.send({ success: true, data: course });
        } else {
          return res.status(404).send({ success : false, message : "Could not retrieve course details - course not found" });
        }
      })
      .catch(next);
  },
  getAnalytics : async(req,res,next) => {
    try {
      let { count : studentsEnrolled } = await Enrolment.findAndCountAll({
        include : [{
          model : Course,
          attributes : constants.course.attributes.list,
          where : { creatorId : req.user.uuid }
        }],
        raw : true
      });

      let user = await User.findOne({
        where : { uuid : req.user.uuid },
        attributes : ["uuid",
          [Sequelize.literal(constants.rawQueries.instructorTotalAmountMade),"amountTotal"],
          [Sequelize.literal(constants.rawQueries.instructorAmountMadeToday),"amountToday"]
        ]
      });

      let { amountTotal, amountToday } = user.get();

      let data = {
        studentsEnrolled,
        amountTotal,
        amountToday,
      };

      res.send({ status : "success", message : "Instructor statistics retrieved",data });
    } catch(e){
      next(e);
    }
  },
  getTransactions : (req,res,next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["page"]);
    if(fieldsValid){
      let { page, limit } = req.query;
      limit = limit ? Number(limit) : 20;
      Transaction.findAndCountAll({
        where : { status : "success" },
        include : [{
          model : Course,
          where : { creatorId : req.user.uuid },
          attributes : constants.course.attributes.list,
        }],
        ...utils.paginate({ page, limit })
      })
        .then(transactions => {
          let pages = Math.ceil(transactions.count / limit);
          return res.send({ success : true, message : "Transactions retrieved", data : transactions.rows, count : transactions.count, pages });
        })
        .catch(next);
    }
  }
};