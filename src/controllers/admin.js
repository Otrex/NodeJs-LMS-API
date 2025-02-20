const utils = require("../utils");
const constants = require("../config/constants");
const { Op, QueryTypes } = require("sequelize");
const Sequelize = require("sequelize");
const models = require("../config/database/models");
const Mailer = require("../services/mailer");
const {
  course: Course,
  courseRevision: CourseRevision,
  category: Category,
  section: Section,
  lecture: Lecture,
  media: Media,
  user: User,
  enrolment: Enrolment,
  paymentProvider: PaymentProvider,
  schoolPaymentProvider: SchoolPaymentProvider,
  setting: Setting,
  transaction: Transaction,
  transactionCourse: TransactionCourse,
  supportTicket: SupportTicket,
  school: School
} = require("../config/database/models");

module.exports = {
  approve: async (req, res, next) => {
    let { courseId } = req.params;

    let course = await Course.findOne({
      where: { uuid: courseId },
      include: [
        { model: CourseRevision, as: "courseRevisions" },
      ]
    });

    if (!course) {
      return res.status(404).send({ success: false, message: "Course not found" });
    }

    let revisionToApprove = course.courseRevisions.find((revision) => revision.status === "review");
    if (!revisionToApprove) {
      return res.status(404).send({ success: false, message: "This course is not under review" });
    }

    let previousLiveRevision = course.courseRevisions.find((revision) => revision.status === "live");
    if (previousLiveRevision) {
      await previousLiveRevision.destroy();
    }

    course.setActiveCourseRevision(revisionToApprove.uuid)
      .then(() => {
        revisionToApprove.status = "live";
        revisionToApprove.save()
          .then(() => {
            return res.send({ success: true, message: "Course approved successfully" });
          });
      })
      .catch(next);
  },
  disapprove: async (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["adminFeedback"]);
    if (fieldsValid) {
      let { courseId } = req.params;

      let course = await Course.findOne({
        where: { uuid: courseId },
        include: [
          { model: CourseRevision, as: "courseRevisions" },
        ]
      });

      if (!course) {
        return res.status(404).send({ success: false, message: "Course not found" });
      }

      let revisionToDisapprove = course.courseRevisions.find((revision) => revision.status === "review");
      if (!revisionToDisapprove) {
        return res.status(404).send({ success: false, message: "This course is not under review" });
      }

      revisionToDisapprove.status = "disapproved";
      revisionToDisapprove.adminFeedback = req.body.adminFeedback;
      revisionToDisapprove.save()
        .then(() => {
          return res.send({ success: true, message: "Course revision disapproved" });
        })
        .catch(next);
    }
  },
  getCoursesUnderReview: (req, res, next) => {
    return getAdminCourses(req, res, next, "review");
  },
  getCourseUnderReview: (req, res, next) => {
    let { courseId } = req.params;
    Course.findOne({
      where: { uuid: courseId },
      include: constants.course.includes.adminReview,
      order: constants.course.order.courseRevisions
    })
      .then(course => {
        if (course) {
          course.setDataValue("activeCourseRevision", course.courseRevisions[0]);
          course = utils.mergeCourseRevisionData(course);
          return res.send({ success: true, message: "Course retrieved successfully", data: course });
        } else {
          return res.status(404).send({ success: false, message: "Course not found" });
        }
      })
      .catch(next);
  },
  updateVideo: (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["url"]);
    if (fieldsValid) {
      let { lectureId } = req.params;
      Lecture.findOne({ where: { uuid: lectureId }, include: [{ model: Media, as: "video" }] })
        .then(lecture => {
          if (lecture) {
            if (lecture.video) {
              lecture.video.url = req.body.url;
              lecture.video.save()
                .then(lecture => {
                  // @TODO Delete lecture video from file system
                  res.send({ success: true, message: "Lecture video updated", data: lecture });
                })
                .catch(next);
            } else {
              return res.status(404).send({ success: false, message: "Lecture video not found" });
            }
          } else {
            return res.status(404).send({ success: false, message: "Lecture not found" });
          }
        })
        .catch(next);
    }
  },
  setFeaturedCourse: async (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["categoryId"]);
    if (fieldsValid) {
      try {
        let { courseId } = req.params;
        let { categoryId } = req.body;

        let category = await Category.findOne({
          where: { uuid: categoryId },
          include: [{ model: Category, as: "subcategories" }]
        });

        if (!category) {
          return res.status(404).send({ success: false, message: "Category not found" });
        }

        let categoryIds = [categoryId];
        if (category.subcategories) {
          let subCategoryIds = category.subcategories.map(category => category.uuid);
          categoryIds = [...categoryIds, ...subCategoryIds];
        }

        let courseToFeature = await Course.findOne({
          where: {
            uuid: courseId,
            "$activeCourseRevision.categoryId$": { [Op.in]: categoryIds }
          },
          include: [{ model: CourseRevision, as: "activeCourseRevision" }]
        });

        if (!courseToFeature) {
          return res.send({ success: false, message: "Course not found" });
        }
        // Unfeature previous featured course in the category
        let previousFeaturedCourse = await Course.findOne({
          where: {
            featured: true,
            "$activeCourseRevision.categoryId$": categoryId
          },
          include: [{ model: CourseRevision, as: "activeCourseRevision" }]
        });

        if (previousFeaturedCourse) {
          previousFeaturedCourse.featured = false;
          previousFeaturedCourse.save();
        }

        Course.update({ featured: true }, { where: { uuid: courseId } })
          .then(result => {
            if (!result[0]) {
              return res.status(404).send({ success: false, message: "Course featuring failed" });
            }
            return res.send({ success: true, message: "Course featured" });
          })
          .catch(next);
      } catch (e) {
        next(e);
      }
    }
  },
  getPaymentProviders: (req, res, next) => {
    PaymentProvider.findAll()
      .then(providers => {
        return res.send({ success: true, message: "Payment providers retrieved successfully", data: providers });
      })
      .catch(next);
  },
  getSchoolPaymentProviders: async (req, res, next) => {
    SchoolPaymentProvider.findAll({
      where: { schoolId: req.school.uuid }
    })
      .then(providers => {
        providers = providers.map((provider) => {
          if (provider.credentials) {
            let credentials = JSON.parse(provider.credentials);
            let { secretKey } = credentials;
            if (secretKey) {
              credentials.secretKey = utils.decryptAPIKey(secretKey);
              provider.setDataValue("credentials", JSON.stringify(credentials));
            }
          }
          return provider;
        });
        return res.send({ success: true, message: "School Payment providers retrieved successfully", data: providers });
      })
      .catch(next);
  },
  setupPaymentProvider: async (req, res, next) => {
    try {
      let fieldsValid = utils.validateReqFields(req, res, ["credentials"]);
      if (fieldsValid) {
        let { providerId } = req.params;
        let paymentProvider = await PaymentProvider.findOne({ where: { uuid: providerId } });

        if (!paymentProvider) {
          return res.status(404).send({ success: false, message: "Payment provider not found" });
        }
        if (paymentProvider.name === "paystack") {
          let { publicKey, secretKey } = req.body.credentials;
          if (!publicKey || !secretKey) {
            return res.status(400).send({
              success: false,
              message: "Paystack public and secret keys must be provided"
            });
          }

          secretKey = utils.encryptAPIKey(secretKey);

          let [createdSchoolPaymentProvider, created] = await SchoolPaymentProvider.findOrCreate({
            where: {
              paymentProviderId: paymentProvider.uuid,
              schoolId: req.school.uuid
            }
          });

          createdSchoolPaymentProvider.credentials = JSON.stringify({ secretKey, publicKey });
          createdSchoolPaymentProvider.save()
            .then(updatedProvider => {
              if (!updatedProvider) {
                return next(new Error("Could not set up payment provider at this time"));
              }
              return res.send({ success: true, message: "Payment provider set-up successful", data: updatedProvider });
            });
        } else if (paymentProvider.name === "monnify") {
          let { bankCode, accountNumber } = req.body.credentials;
          
          if (!bankCode || !accountNumber) {
            return res.status(400).send({
              success: false,
              message: "One or more of the required fields for Monnify set up are missing"
            });
          }
          let monnifySubAccountCredentials = JSON.parse(JSON.stringify(req.body.credentials));
          monnifySubAccountCredentials.currencyCode = "NGN";
          monnifySubAccountCredentials.email = req.user.email;
          let schoolMonnifySubAccount = await utils.createMonnifySubAccount(monnifySubAccountCredentials);

          let [createdSchoolPaymentProvider, created] = await SchoolPaymentProvider.findOrCreate({
            where: {
              paymentProviderId: paymentProvider.uuid,
              schoolId: req.school.uuid
            }
          });

          createdSchoolPaymentProvider.credentials = { monnifySubAccountCode: schoolMonnifySubAccount };
          createdSchoolPaymentProvider.save()
            .then(updatedProvider => {
              if (!updatedProvider) {
                return next(new Error("Could not set up payment provider at this time"));
              }
              return res.send({ success: true, message: "Payment provider set-up successful", data: updatedProvider });
            });
        } else {
          return res.status(404).send({ success: false, message: "Payment provider not found" });
        }
      }
    } catch (e) {
      next(e);
    }
  },
  activatePaymentProvider: async (req, res, next) => {
    try {
      let { schoolProviderId } = req.params;
      let schoolPaymentProvider = await SchoolPaymentProvider.findOne({
        where: {
          uuid: schoolProviderId,
          schoolId: req.school.uuid
        },
        include: [{ model: PaymentProvider, required: true }]
      });

      if (!schoolPaymentProvider) {
        return res.status(404).send({ success: false, message: "Payment provider not found" });
      }

      let credentialsValid = utils.checkPaymentProviderCredentials(schoolPaymentProvider);
      if (!credentialsValid) {
        return res.send({
          success: false,
          message: "You can't activate this payment provider yet because you haven't set it up"
        });
      }
      schoolPaymentProvider.status = "active";
      schoolPaymentProvider.save()
        .then(updatedProvider => {
          return res.send({ success: true, message: "Payment provider activated successfully", data: updatedProvider });
        })
        .catch(next);
    } catch (e) {
      next(e);
    }
  },
  deactivatePaymentProvider: async (req, res, next) => {
    try {
      let { schoolProviderId } = req.params;
      let paymentProvider = await SchoolPaymentProvider.findOne({
        where: {
          uuid: schoolProviderId,
          schoolId: req.school.uuid
        }
      });

      if (!paymentProvider) {
        return res.status(404).send({ success: false, message: "Payment provider not found" });
      }
      paymentProvider.status = "inactive";
      paymentProvider.save()
        .then(updatedProvider => {
          return res.send({ success: true, message: "Payment provider activated successfully", data: updatedProvider });
        })
        .catch(next);
    } catch (e) {
      next(e);
    }
  },
  activateAffiliateSales: async (req, res, next) => {
    try {
      let schoolSettings = await Setting.findOne({ where: { schoolId: req.school.uuid } });

      if (!schoolSettings) {
        return res.send({ success: false, message: "An error occurred - School settings record not found" });
      }
      schoolSettings.affiliateSalesStatus = "active";
      schoolSettings.save()
        .then(updatedSettings => {
          return res.send({ success: true, message: "Affiliate sales activated successfully", data: updatedSettings });
        })
        .catch(next);
    } catch (e) {
      next(e);
    }
  },
  deActivateAffiliateSales: async (req, res, next) => {
    try {
      let schoolSettings = await Setting.findOne({ where: { schoolId: req.school.uuid } });

      if (!schoolSettings) {
        return res.send({ success: false, message: "An error occurred - School settings record not found" });
      }
      schoolSettings.affiliateSalesStatus = "inactive";
      schoolSettings.save()
        .then(updatedSettings => {
          return res.send({ success: true, message: "Affiliate sales activated successfully", data: updatedSettings });
        })
        .catch(next);
    } catch (e) {
      next(e);
    }
  },
  addAdmin: (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["email"]);
    if (fieldsValid) {
      let { email } = req.body;
      // Edge case - super admin enters their own mail
      if (email == req.user.email) {
        return res.status(403).send({ success: false, message: "Not allowed, Please enter a different user's email" });
      }
      User.findOne({ where: { email } })
        .then(user => {
          if (!user) {
            return res.status(404).send({ success: false, message: `User with email '${email}' not found` });
          }
          user.role = "admin";
          user.save()
            .then(() => {
              return res.send({ success: true, message: "User has been made admin successfully" });
            })
            .catch(next);
        })
        .catch(next);
    }
  },
  removeAdmin: (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["email"]);
    if (fieldsValid) {
      let { email } = req.body;
      // Edge case - super admin enters their own mail
      if (email == req.user.email) {
        return res.status(403).send({ success: false, message: "Not allowed, Please enter a different admin's email" });
      }
      User.findOne({ where: { email, role: "admin" } })
        .then(user => {
          if (!user) {
            return res.status(404).send({ success: false, message: `Admin with email '${email}' not found` });
          }
          user.role = "user";
          user.save()
            .then(() => {
              return res.send({ success: true, message: "User has been successfully removed as admin" });
            })
            .catch(next);
        })
        .catch(next);
    }
  },
  getUsers: async (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["page"]);
    if (fieldsValid) {
      let { page, limit } = req.query;
      limit = limit ? Number(limit) : 20;

      User.findAndCountAll({
        where: {
          schoolId: req.school.uuid
        },
        attributes: [
          "uuid", "firstName", "lastName", "email", "createdAt"
        ],
        include: [
          {
            model: Enrolment,
            attributes: ["uuid"],
            include: [
              {
                model: Course,
                attributes: ["uuid", "createdAt"],
                include: constants.course.includes.list
              }
            ]
          }
        ],
        ...utils.paginate({ page, limit })
      })
        .then(users => {
          console.log(users.count, users.rows.length);
          let pages = Math.ceil(users.rows.length / limit);

          users.rows = users.rows.map((user) => {
            // user.setDataValue("createdCourses", user.courses.map((course) => utils.mergeCourseRevisionData(course)));
            user.enrolments = user.enrolments.map((enrolment) => {
              enrolment.setDataValue("course", utils.mergeCourseRevisionData(enrolment.course));
              return enrolment;
            });
            return user;
          });
          res.send({ success: true, message: "Users retrieved", data: users.rows, count: users.rows.length, pages });
        })
        .catch(next);
    }
  },

  getSingleUser: async (req, res, next) => {
    User.findOne({
      where: {
        schoolId: req.school.uuid,
        uuid: req.params.userId
      },
      attributes: [
        "uuid", "firstName", "lastName", "email", "createdAt"
      ],
      include: [
        {
          model: Enrolment,
          attributes: ["uuid"],
          include: [
            {
              model: Course,
              attributes: ["uuid", "createdAt"],
              include: constants.course.includes.list
            }
          ]
        }
      ]
    })
      .then(user => {
        user.enrolments = user.enrolments.map((enrolment) => {
          enrolment.setDataValue("course", utils.mergeCourseRevisionData(enrolment.course));
          return enrolment;
        });
        res.send({ success: true, message: "User retrieved", data: user });
      })
      .catch(next);
  },
  revertCourseContentToDraft: (req, res, next) => {
    // idType = courseId || lectureId || sectionId
    let idType = Object.keys(req.body).find((field) => field.includes("Id"));
    if (idType) {
      let contentModel = utils.getModelByIdType(idType);
      if (contentModel) {
        // contentModel = Course || Lecture || Section
        contentModel.findOne({ where: { uuid: req.body[idType] } })
          .then(content => {
            if (!content) {
              return res.status(404).send({ success: false, message: `${contentModel.name} not found` });
            }
            content.status = constants.status.draft;
            content.save()
              .then(content => {
                utils.updateContentChildrenStatus(contentModel, content.uuid, constants.status.draft);
                res.send({ success: true, message: `${contentModel.name} reverted to draft`, data: content });
              })
              .catch(next);
          })
          .catch(next);
      } else {
        res.status(400).send({ success: false, message: `Content type could not be determined by ${idType}` });
      }
    } else {
      return res.status(400).send({ success: false, message: "Content Id not provided" });
    }
  },
  updateSettings: async (req, res, next) => {
    try {
      let settings = await Setting.findOne({});
      if (!settings) {
        return res.status(500).send({ success: false, message: "Settings could not be updated" });
      }
      for (let field in req.body) {
        settings[field] = req.body[field];
      }
      settings.save()
        .then(() => {
          return res.send({ success: true, message: "Settings updated" });
        })
        .catch(next);
    } catch (e) {
      next(e);
    }
  },
  getPlatformAnalytics: async (req, res, next) => {
    try {
      const TODAY_START = new Date().setHours(0, 0, 0, 0);
      const NOW = new Date();
      const queryType = { type: QueryTypes.SELECT };

      let totalEnrolments = await Enrolment.count({});
      let totalEnrolmentsToday = await Enrolment.count({
        where: { createdAt: { [Op.ge]: TODAY_START, [Op.le]: NOW } }
      });
      let totalAmount = await models.sequelize.query(constants.rawQueries.totalAmountMade, queryType);
      let totalAmountToday = await models.sequelize.query(constants.rawQueries.totalAmountMadeToday, queryType);
      let totalInstructorEarnings = await models.sequelize.query(constants.rawQueries.totalInstructorsAmount, queryType);
      let totalInstructorEarningsToday = await models.sequelize.query(constants.rawQueries.totalInstructorsAmountToday, queryType);

      let data = {
        totalEnrolments,
        totalEnrolmentsToday,
        totalEarnings: totalAmount[0].amount,
        totalEarningsToday: totalAmountToday[0].amount,
        totalInstructorEarnings: totalInstructorEarnings[0].amount,
        totalInstructorEarningsToday: totalInstructorEarningsToday[0].amount
      };

      res.send({ success: true, message: "Analytics retrieved", data });

    } catch (e) {
      next(e);
    }
  },
  getTransactions: async (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["page"]);
    if (fieldsValid) {
      let { page, limit } = req.query;
      limit = limit ? Number(limit) : 20;

      Transaction.findAndCountAll({
        include: [{
          model: Course,
          attributes: constants.course.attributes.list,
          include: constants.course.includes.list
        }],
        ...utils.paginate({ page, limit })
      })
        .then(transactions => {
          let pages = Math.ceil(transactions.count / limit);
          return res.send({
            success: true,
            message: "Transactions retrieved",
            data: transactions.rows,
            count: transactions.count,
            pages
          });
        })
        .catch(next);
    }

  },
  enrollUserToCourse: async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const courseId = req.params.courseId;
      const schoolId = req.params.schoolId;

      const school = await School.findOne({
        where: {
          uuid: schoolId
        }
      });

      const user = await User.findOne({
        where: {
          uuid: userId
        }
      });
      const course = await Course.findOne({
        where: {
          uuid: courseId
        },
        include: [
          {
            model: CourseRevision,
            as: "activeCourseRevision",
            where: { status: "live" }
          }
        ]
      });
      if (!course) {
        return res.status(404).send({
          success: false,
          message: "course not found"
        });
      }
      let { promoAmount, amount } = course.activeCourseRevision;
      let _amount = promoAmount ? promoAmount : amount;
      let transaction = await Transaction.create({
        userId: userId,
        schoolId: schoolId,
        paymentGateway: "external",
        amount: _amount
      });

      await TransactionCourse.create({
        coursePricePercentage: 0,
        courseId: courseId,
        amount: _amount,
        free: false,
        transactionId: transaction.uuid
      });
      Transaction.update({
        status: "success",
        paidAt: transaction.paidAt
      }, {
        where: { uuid: transaction.uuid }
      });
      await utils.enrolUserIntoCourse(userId, schoolId, courseId, transaction.uuid);
      if (user.email) {
        await Mailer.sendCourseEnrolmentMail({
          school: school,
          user: user,
          course: course
        });
      }
      res.status(200).send({ success: true, message: "Enrolment successful" });
    } catch (e) {
      next(e);
    }
  },

  /*  ===---- NEW ENDPOINTS -----===  */

  getLiveCourses: async (req, res, next) => {
  },
  getFeaturedCourses: async (req, res, next) => {
    try {
      let fieldsValid = utils.validateReqFields(req, res, ["page"]);
      if (fieldsValid) {
        let { page, limit } = req.query;
        limit = limit ? limit : constants.course.pagination.limit;

        let courses = await Course.findAndCountAll({
          where: { featured: true, schoolId: req.school.uuid },
          attributes: constants.course.attributes.list,
          include: constants.course.includes.list,
          ...utils.paginate({ page, limit })
        });

        let pages = Math.ceil(courses.count / limit);
        if (courses.rows.length) {
          courses.rows = courses.rows.map((course) => utils.mergeCourseRevisionData(course));
          return res.send({
            success: true,
            message: "Courses retrieved",
            data: courses.rows,
            count: courses.count,
            pages
          });
        } else if (page == 1) {
          return res.status(200).send({ success: true, message: "No courses found", data: [] });
        }
        return res.status(200).send({ success: true, message: "No more results", data: [] });
      }
    } catch (e) {
      next(e);
    }
  },
  getAllCourses: (req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["page"]);
    if (fieldsValid) {
      let { page, limit } = req.query;
      limit = limit ? Number(limit) : 20;

      Course.findAndCountAll({
        where: { schoolId: req.school.uuid },
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
          res.send({ success: true, message: "Courses retrieved", data: courses.rows, count: courses.count, pages });
        })
        .catch(next);
    }
  },
  getSingleCourse: async (req, res, next) => {
    let { courseId } = req.params;
    Course.findOne({
      where: {
        uuid: courseId,
        schoolId: req.school.uuid
      },
      attributes: constants.course.attributes.instructor,
      include: constants.course.includes.instructor,
      order: constants.course.order.courseRevisions
    })
      .then(course => {
        if (course) {
          course = utils.setInstructorRevision(course);
          course = utils.mergeCourseRevisionData(course);
          return res.send({ success: true, message: "Course data retrieved successfully", data: course });
        } else {
          return res.status(404).send({
            success: false,
            message: "Could not retrieve course details - course not found"
          });
        }
      })
      .catch(next);
  },
  getDraftCourses: async (req, res, next) => {
    return getAdminCourses(req, res, next, "draft");
  },
  publishCourse: async (req, res, next) => {
    try {
      let { courseId, schoolId } = req.params;
      let course = await Course.findOne({
        where: { uuid: courseId, schoolId },
        include: [
          { model: CourseRevision, as: "courseRevisions" },
        ]
      });

      if (!course) {
        return res.status(404).send({ success: false, message: "Course not found" });
      }

      let revisionToApprove = course.courseRevisions.find((revision) => revision.status !== "live");
      if (!revisionToApprove) {
        return res.status(404).send({ success: false, message: "This course is already live" });
      }

      let previousLiveRevision = course.courseRevisions.find((revision) => revision.status === "live");
      if (previousLiveRevision) {
        await previousLiveRevision.destroy();
      }

      course.setActiveCourseRevision(revisionToApprove.uuid)
        .then(() => {
          revisionToApprove.status = "live";
          revisionToApprove.save()
            .then(() => {
              return res.send({ success: true, message: "Course published successfully" });
            });
        })
        .catch(next);
    } catch (e) {
      next(e);
    }
  },
  getAnalytics: async (req, res, next) => {
    try {
      const TODAY_START = new Date();
      TODAY_START.setHours(0, 0, 0);
      const NOW = new Date();

      let totalCourses = await Course.count({
        where: { schoolId: req.school.uuid }
      });
      let totalCoursesToday = await Course.count({
        where: { schoolId: req.school.uuid, createdAt: { [Op.gt]: TODAY_START, [Op.lt]: NOW } }
      });

      let totalEnrolments = await Enrolment.count({});
      let totalEnrolmentsToday = await Enrolment.count({
        where: { createdAt: { [Op.gt]: TODAY_START, [Op.lt]: NOW } }
      });

      let eligibleTransactions = await Transaction.findAll({
        where: { schoolId: req.school.uuid }
      });
      let eligibleTransactionsToday = await Transaction.findAll({
        where: { schoolId: req.school.uuid, createdAt: { [Op.gt]: TODAY_START, [Op.lt]: NOW } }
      });
      let totalEarnings = eligibleTransactions.reduce((prev, curr) => {
        return prev + curr.amount;
      }, 0);
      let totalEarningsToday = eligibleTransactionsToday.reduce((prev, curr) => {
        return prev + curr.amount;
      }, 0);

      let data = {
        totalCourses,
        totalCoursesToday,
        totalEnrolments,
        totalEnrolmentsToday,
        totalEarnings,
        totalEarningsToday
      };

      res.send({ success: true, message: "Analytics retrieved", data });

    } catch (e) {
      next(e);
    }
  }
};


function getAdminCourses(req, res, next, type) {
  let courseIncludes;
  switch (type) {
  case "draft":
    courseIncludes = constants.course.includes.adminDraftList;
    break;
  case "review":
    courseIncludes = constants.course.includes.adminReviewList;
    break;
  default:
    courseIncludes = constants.course.includes.adminDraftList;
  }

  let fieldsValid = utils.validateReqFields(req, res, ["page"]);
  if (fieldsValid) {
    let { page, limit } = req.query;
    limit = limit ? limit : constants.course.pagination.limit;

    Course.findAndCountAll({
      where: { schoolId: req.school.uuid },
      attributes: constants.course.attributes.list,
      include: courseIncludes,
      ...utils.paginate({ page, limit })
    })
      .then(courses => {
        let pages = Math.ceil(courses.count / limit);

        courses.rows = courses.rows.map(course => {
          course.setDataValue("activeCourseRevision", course.courseRevisions[0]);
          return utils.mergeCourseRevisionData(course);
        });
        return res.send({
          success: true,
          message: "Courses retrieved successfully",
          data: courses.rows,
          count: courses.count,
          pages
        });
      })
      .catch(next);
  }
}
