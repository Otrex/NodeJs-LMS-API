const Sequelize = require("sequelize");
const { Op } = require("sequelize");

const {
  user : User,
  section : Section,
  lecture : Lecture,
  media : Media,
  enrolment : Enrolment,
  category : Category,
  courseRevision: CourseRevision,
  lectureContent: LectureContent
} = require("./database/models");

// Course
let courseListFields = [
  "uuid","featured","createdAt",
  [Sequelize.literal("(SELECT AVG(rating) FROM enrolments WHERE enrolments.courseId = uuid AND rating >= 1)"),"averageRating"],
  [Sequelize.literal("(SELECT COUNT(rating) FROM enrolments WHERE enrolments.courseId = uuid AND rating >= 1)"),"noOfRatings"],
  [Sequelize.literal("(SELECT count(*) from lectures inner join sections on lectures.sectionId = sections.uuid where sections.courseRevisionId = activeCourseRevisionId)"),"noOfLectures"],
];
let courseDetailFields = [...courseListFields];
let courseEnrolledFields = [...courseDetailFields];
let courseInstructorFields = [...courseListFields];


// Course Revision
let courseRevisionListFields = ["uuid","status","amount","promoAmount","title","currency","categoryId","courseId","about","slug","free"];
let courseRevisionDetailFields = [...courseRevisionListFields,"skills","learningOutcomes","subtitle","requirements","imageId"];
let courseRevisionEnrolledFields = [...courseRevisionDetailFields, "welcomeMessage","congratulatoryMessage"];
let courseRevisionInstructorFields = [...courseRevisionEnrolledFields, "adminFeedback"];

let userImage = [ { model : Media, as : "image", attributes : ["url"] } ];

module.exports = {
  lectureContentTypes: ["video","audio","note","pdf"],
  status : {
    draft : "draft",
    review : "review",
    live : "live",
    disapproved : "disapproved"
  },
  user : {
    includes : userImage
  },
  courseRevision: {
    attributes: {
      list : [...courseRevisionListFields],
      detail : [...courseRevisionDetailFields],
      enrolled : [...courseRevisionEnrolledFields],
      instructor : [...courseRevisionInstructorFields]
    },
    includes : {
      list : [
        { model : Media, as : "image", attributes : ["url"] }
      ],
      detail : [
        { model : Media, as : "image", attributes : ["url"] },
        { model : Category, include : [{ model: Category, as : "parentCategory" }] },
        {
          model : Section,
          attributes : ["title","index"],
          include : [{
            model : Lecture,
            attributes : ["title","index"]
          }]
        }
      ]
    }
  },
  course : {
    pagination : {
      limit : 20
    },
    clauses : {
      live : { status : "live" },
      review : { status : "review" },
      draft : { status : "draft" },
      disapproved : { status : "dispproved" }
    },
    attributes : {
      list : [...courseListFields],
      detail : [...courseDetailFields],
      enrolled : [...courseEnrolledFields],
      instructor : [...courseInstructorFields]
    },
    includes : {
      list: [
        {
          model : User,
          as : "instructor",
          attributes : ["uuid","firstName","lastName"],
          include : userImage
        },
        {
          model: CourseRevision,
          where: { status: "live" },
          as: "activeCourseRevision",
          attributes: courseRevisionListFields,
          include: [
            { model : Media, as : "image", attributes : ["url"] },
            { model : Category, include : [{ model : Category, as : "parentCategory" }] },
          ]
        },
      ],
      listWithoutInstructor: [
        {
          model: CourseRevision,
          where: { status: "live" },
          as: "activeCourseRevision",
          attributes: courseRevisionListFields,
          include: [
            { model : Media, as : "image", attributes : ["url"] },
            { model : Category, include : [{ model : Category, as : "parentCategory" }] },
          ]
        }
      ],
      instructorList: [
        {
          model : User,
          as : "instructor",
          attributes : ["uuid","firstName","lastName"],
          include : userImage
        },
        {
          model: CourseRevision,
          as: "courseRevisions",
          where: { title: { [Op.ne]: null } },
          attributes: courseRevisionListFields,
          include: [
            { model : Media, as : "image", attributes : ["url"] },
            { model : Category, include : [{ model : Category, as : "parentCategory" }] },
          ]
        }
      ],
      adminList: [
        {
          model : User,
          as : "instructor",
          attributes : ["uuid","firstName","lastName"],
          include : userImage
        },
        {
          model: CourseRevision,
          as: "courseRevisions",
          where: { title: { [Op.ne]: null } },
          attributes: courseRevisionListFields,
          include: [
            { model : Media, as : "image", attributes : ["url"] },
            { model : Category, include : [{ model : Category, as : "parentCategory" }] },
          ]
        }
      ],
      adminReviewList: [
        {
          model : User,
          as : "instructor",
          attributes : ["uuid","firstName","lastName"],
          include : userImage
        },
        {
          model: CourseRevision,
          as: "courseRevisions",
          where: { title: { [Op.ne]: null }, status: "review" },
          attributes: courseRevisionListFields,
          include: [
            { model : Media, as : "image", attributes : ["url"] },
            { model : Category, include : [{ model : Category, as : "parentCategory" }] },
          ]
        }
      ],
      adminDraftList: [
        {
          model : User,
          as : "instructor",
          attributes : ["uuid","firstName","lastName"],
          include : userImage
        },
        {
          model: CourseRevision,
          as: "courseRevisions",
          where: { title: { [Op.ne]: null }, status: "draft" },
          attributes: courseRevisionListFields,
          include: [
            { model : Media, as : "image", attributes : ["url"] },
            { model : Category, include : [{ model : Category, as : "parentCategory" }] },
          ]
        }
      ],
      detail : [
        { model : User, as : "instructor", include : userImage },
        {
          model: CourseRevision,
          where: { status: "live" },
          as: "activeCourseRevision",
          attributes: courseRevisionDetailFields,
          include: [
            { model : Media, as : "image", attributes : ["url"] },
            { model : Category, include : [{ model: Category, as : "parentCategory" }] },
            {
              model : Section,
              attributes : ["title","index"],
              include : [ {
                model : Lecture,
                attributes : ["title","index"]
              }]
            },
          ]
        }
      ],
      enrolled : [
        { model : User, as : "instructor", include : userImage },
        {
          model: CourseRevision,
          as: "activeCourseRevision",
          where: { status: "live" },
          attributes: courseRevisionEnrolledFields,
          include: [
            { model : Media, as : "image", attributes : ["url"] },
            { model : Category, include : [{ model : Category, as : "parentCategory" }] },
            {
              model : Section,
              include : [ {
                model : Lecture,
                include : [ { model: LectureContent } ]
              }],
            }
          ]
        },
      ],
      adminReview: [
        { model: User, as: "instructor", include: userImage },
        {
          model: CourseRevision,
          as: "courseRevisions",
          where: { status: "review" },
          include: [
            { model: Media, as: "image", attributes: ["url"] },
            { model: Category, include: [{ model: Category, as: "parentCategory" }] },
            {
              model: Section,
              include: [ {
                model: Lecture,
                include: [ { model: LectureContent } ]
              }]
            },
          ]
        }
      ],
      instructor: [
        { model: User, as: "instructor", include: userImage },
        {
          model: CourseRevision,
          as: "courseRevisions",
          attributes: [...courseRevisionInstructorFields],
          include: [
            { model : Media, as : "image", attributes : ["url"] },
            { model : Category, include : [{ model: Category, as : "parentCategory" }] },
            {
              model : Section,
              include : [{
                model : Lecture,
                include : [{ model: LectureContent } ]
              }]
            },
          ]
        }
      ]
    },
    order : {
      activeCourseRevision: {
        withContent: [
          ["activeCourseRevision", Section, "index", "ASC"],
          ["activeCourseRevision", Section, Lecture, "index", "ASC"],
          ["activeCourseRevision", Section, Lecture, LectureContent, "index", "ASC"]
        ],
        withoutContent: [
          ["activeCourseRevision", Section, "index", "ASC"],
          ["activeCourseRevision", Section, Lecture, "index", "ASC"],
        ],
      },
      courseRevisions: [
        ["courseRevisions", Section, "index", "ASC"],
        ["courseRevisions", Section, Lecture, "index", "ASC"],
        ["courseRevisions", Section, Lecture, LectureContent, "index", "ASC"]
      ]
    }
  },
  courseRevision: {

  },
  rawQueries : {
    instructorTotalAmountMade: `(
        SELECT COALESCE(SUM(transactionCourses.amount - ((transactionCourses.amount*transactionCourses.coursePricePercentage)/100)),0)
          from transactionCourses INNER JOIN transactions on transactionCourses.transactionId = transactions.uuid INNER JOIN courses on transactionCourses.courseId = courses.uuid
          where transactions.status = "success" and courses.creatorId = user.uuid
        )`,
    instructorAmountMadeToday: `(
        SELECT COALESCE(SUM(transactionCourses.amount - ((transactionCourses.amount*transactionCourses.coursePricePercentage)/100)),0)
          from transactionCourses INNER JOIN transactions on transactionCourses.transactionId = transactions.uuid INNER JOIN courses on transactionCourses.courseId = courses.uuid
          where transactions.status = "success" and courses.creatorId = user.uuid
          and date(transactions.createdAt) = curdate()
        )`,
    totalAmountMade: `(
        SELECT COALESCE(SUM(transactionCourses.amount * transactionCourses.coursePricePercentage)/100,0) AS amount
        from transactionCourses INNER JOIN transactions on transactionCourses.transactionId = transactions.uuid
        where transactions.status = "success"
        )`,
    totalAmountMadeToday: `(
          SELECT COALESCE(SUM(transactionCourses.amount * transactionCourses.coursePricePercentage)/100,0) AS amount
          from transactionCourses INNER JOIN transactions on transactionCourses.transactionId = transactions.uuid
          where transactions.status = "success"
          and date(transactions.createdAt) = curdate()
        )`,
    totalInstructorsAmount: `(
        SELECT COALESCE(SUM(transactionCourses.amount - ((transactionCourses.amount*transactionCourses.coursePricePercentage)/100)),0) AS amount
        from transactionCourses INNER JOIN transactions on transactionCourses.transactionId = transactions.uuid
        where transactions.status = "success"
        )`,
    totalInstructorsAmountToday: `(
        SELECT COALESCE(SUM(transactionCourses.amount - ((transactionCourses.amount*transactionCourses.coursePricePercentage)/100)),0) AS amount
        from transactionCourses INNER JOIN transactions on transactionCourses.transactionId = transactions.uuid
        where transactions.status = "success"
        AND date(transactions.createdAt) = curdate()
        )`,
    totalInstructorPayoutDue: `(
        SELECT COALESCE(SUM(transactions.amount - ((transactions.amount * transactions.coursePricePercentage)/100)),0) AS amount
        from transactions inner join courses on transactions.courseId = courses.uuid
        where transactions.status = "success"
        AND transactions.paidToInstructor = false
        AND courses.creatorId = user.uuid
      )`
  },

};