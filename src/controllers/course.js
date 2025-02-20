const constants = require("../config/constants");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const utils = require("../utils");
const { v4: uuidv4 } = require("uuid");
const {
  course : Course,
  courseRevision: CourseRevision,
  category : Category,
  order:Order,
  user:User,
  lecture:Lecture,
  section:Section,
  media:Media,
  enrolment:Enrolment,
  view:View,
  schoolAdministrator: SchoolAdministrator
} = require("../config/database/models");

module.exports = {
  create: async(req,res,next) => {
    try{
      if(!req.user && req.dumoAccountId){
        let accessToken = req.headers["authorization"].split(" ")[1];
        req.user = await utils.createInstructorAccount(accessToken, req.dumoAccountId , req.school.uuid);
      }
      // Check that instructor doesn't have any empty course
      let title = req.body.title ? req.body.title : null;

      let existingCourse = await Course.findOne({
        where: { creatorId: req.user.uuid, schoolId: req.school.uuid },
        include:[{ model: CourseRevision,as: "activeCourseRevision",where: { title } }]
      });

      if(existingCourse){
        existingCourse = utils.mergeCourseRevisionData(existingCourse);
        return res.status(200).send({ success: true, message: "Course created successfully", data: existingCourse });
      }
      // An empty course by this user does not exist, create one.
      let createdRevision = await CourseRevision.create({ ...req.body });
      let createdCourse = await Course.create({
        creatorId: req.user.uuid,
        activeCourseRevisionId: createdRevision.uuid,
        schoolId: req.school.uuid
      });

      createdRevision.courseId = createdCourse.uuid;
      createdRevision.save()
        .then(async() => {
          let course = await Course.findOne({
            where: { uuid: createdCourse.uuid },
            include: [
              {
                model: CourseRevision,
                attributes: { exclude: ["uuid","createdAt","updatedAt","deletedAt"] },
                as: "activeCourseRevision"
              }
            ]
          });

          course = utils.mergeCourseRevisionData(course);
          res.send({ success: true, message: "Course created successfully", data: course });
        })
        .catch(next);
    } catch(e){
      next(e);
    }
  },
  update: async(req,res,next) => {
    let fieldsValid = utils.validateReqFields(req,res);
    if(fieldsValid){
      let { courseId } = req.params;

      let course = await Course.findOne({
        where : { uuid: courseId },
        include: [{ model: CourseRevision, as: "courseRevisions"}]
      });

      if(!course){
        return res.send({ success : false, message : "Course not found" });
      }

      // Can't update a course under review
      let revisionUnderReview = course.courseRevisions.find((revision) => revision.status == "review");
      if(revisionUnderReview){
        return res.status(403).send({ success: false, message: "This course is being review and so can't be updated" });
      }

      let courseRevisionToUpdate = course.courseRevisions.find((revision) => ["draft","disapproved"].includes(revision.status))

      if(!courseRevisionToUpdate){
        return res.status(500).send({ success: false, message: "Something went wrong - Course update failed" });
      }

      // Everything will now be updated on 'courseRevisionToUpdate'
      let courseImage = req.body.image;
      if(courseImage){
        let imageUrl = utils.spaces.createObjectReference('course-images');
        let image = await Media.create({ url: imageUrl });
        if(image){
          courseRevisionToUpdate.setImage(image.uuid);
          console.log(`Created course image => ${image.get()}`);
        }
      }

      for(let field in req.body){
        if (field === "title" && !courseRevisionToUpdate.slug ) {
          courseRevisionToUpdate.slug = utils.createSlug(req.body['title']);
        }
        courseRevisionToUpdate[field] = req.body[field];
      }

      courseRevisionToUpdate.save()
        .then(async(updatedCourseRevision) => {
          let updatedCourse = await Course.findOne({
            where: { uuid: courseId },
            include: [
              {
                model: CourseRevision,
                as: "courseRevisions",
                where: { uuid: courseRevisionToUpdate.uuid },
                include: [{ model: Media, as: "image" }]
              }
            ]
          });

          updatedCourse.activeCourseRevision = updatedCourse.courseRevisions[0];
          updatedCourse = utils.mergeCourseRevisionData(updatedCourse);

          delete updatedCourse.courseRevisions;
          let response = { success: true, message: "Course updated successfully", data: updatedCourse };

          // Add image upload URL if any.
          if(courseImage){
            response.uploadUrl = utils.spaces.createUploadUrl(updatedCourse.image.url, courseImage.type);
          }
          return res.send(response);
        })
        .catch(next);
    }
  },
  createNewRevision: async(req, res, next) => {
    try{
      let { courseId, schoolId } = req.params;
      let liveCourse = await Course.findOne({
        where: { uuid: courseId, schoolId },
        include:[
          {
            model: CourseRevision,
            where: { status: "live" },
            as: "activeCourseRevision",
          },
          {
            model: CourseRevision,
            as: "courseRevisions"
          }
        ]
      });

      if(!liveCourse){
        return res.status(404).send({success: false, message: "Course not found or isn't live"});
      }
      // Unallow creation of multiple revisions
      if(!(liveCourse.activeCourseRevision && liveCourse.courseRevisions.length === 1)){
        return res.send({success: false, message: "A draft revision of this course already exists"});
      }

      // return res.send({success: true, message: "Course retrieved", data: liveCourse});
      let newCourseRevision = await utils.createNewCourseRevision(liveCourse.uuid);
      if(!newCourseRevision){
        return res.status(500).send({success: false, message: "New course revision creation failed"});
      }

      return res.send({success: true, message: "New course revision created successfully", data: newCourseRevision});

    } catch(e){
      next(e);
    }
  },
  getLiveCoursesByCategory: async(req,res,next) => {
    let fieldsValid = utils.validateReqFields(req,res,["page"]);
    if(fieldsValid){
      try {
        let { slug } = req.params;
        let { page, limit } = req.query;
        limit = limit ? limit : constants.course.pagination.limit;

        let category = await Category.findOne({
          where: { slug, schoolId: req.school.uuid },
          include: [
            { model: Category, as : "parentCategory" },
            { model: Category, as: "subcategories" }
          ]
        });

        if(!category){
          return res.send({ success : false, message:"Category not found" });
        }

        console.log(category.toJSON());
        let categoriesToReturn = [ category.uuid ];
        if(category.subcategories && category.subcategories.length){
          let subcategoryIds = category.subcategories.map((cat) => cat.uuid);
          categoriesToReturn = [ ...categoriesToReturn, ...subcategoryIds ];
        }

        Course.findAndCountAll({
          where: {
            "$activeCourseRevision.categoryId$": { [Op.in]: categoriesToReturn },
            schoolId: req.school.uuid
          },
          attributes: constants.course.attributes.list,
          include: constants.course.includes.list,
          ...utils.paginate({ page, limit })
        })
          .then(courses => {
            let pages = Math.ceil(courses.count / limit);
            if(courses.rows.length){
              courses.rows = courses.rows.map(course => utils.mergeCourseRevisionData(course));
              return res.send({ success : true, message : "Courses retrieved", data : courses.rows, count : courses.count, pages, category });
            } else if(page == 1){
              return res.status(200).send({ success : true, message : "No courses in this category", data : [], category });
            }
            return res.status(200).send({ success : true, message : "No more results", data : [], category });
          })
          .catch(next);
      } catch(e){
        next(e);
      }
    }
  },
  getSingleCourseDetails : (req,res,next) => {
    let { slug } = req.params;
    Course.findOne({
      where: { "$activeCourseRevision.slug$": slug },
      attributes: constants.course.attributes.detail,
      include: constants.course.includes.detail,
      order: constants.course.order.activeCourseRevision.withoutContent
    })
      .then(course => {
        if(course){
          utils.incrementCourseViews(course.uuid, req.ip);
          course = utils.mergeCourseRevisionData(course);
          return res.send({ success : true, message: "Course data retrieved successfully",data : course });
        } else {
          return res.status(404).send({ success: false, message: "Could not retrieve course details - course not found" });
        }
      })
      .catch(next);
  },
  getEnrolledCourses : (req,res,next) => {
    Enrolment.findAll({
      where : { userId : req.user.uuid, schoolId: req.school.uuid },
      include : {
        model : Course,
        attributes : constants.course.attributes.list,
        include : constants.course.includes.list
      },
      order : [["createdAt","DESC"]]
    })
      .then(enrolments => {
        let courses = enrolments.map(enrolment => {
          enrolment.course = enrolment.course.get();

          // Add course progress percentage
          enrolment.completedLectures = Array.isArray(enrolment.completedLectures) ? enrolment.completedLectures.length : 0;
          let courseProgress = (enrolment.completedLectures/enrolment.course.noOfLectures)*100;
          enrolment.course.courseProgress = courseProgress;
          enrolment.course.completedLectures = enrolment.completedLectures;

          enrolment.course = utils.mergeCourseRevisionData(enrolment.course);
          return enrolment.course;
        });
        res.send({ success: true, message: "Courses retrieved", data: courses });
      })
      .catch(next);
  },
  getEnrolledCourse: async(req,res,next) => {
    let { slug } = req.params;

    let course = await Course.findOne({
      where: { "$activeCourseRevision.slug$": slug },
      attributes: constants.course.attributes.enrolled,
      include: constants.course.includes.enrolled,
    });

    if(!course){
      return res.status(404).send({ success : false, message : "Course not found" });
    }

    let enrolment = await Enrolment.findOne({
      where: { userId: req.user.uuid, courseId: course.uuid, schoolId: req.school.uuid }
    });

    if(!enrolment){
      return res.status(401).send({ success : false, message : "You can't access this course" });
    }

    course = course.get();
    // Set completed status on lectures
    if(course.activeCourseRevision.sections && Array.isArray(enrolment.completedLectures)){
      course.activeCourseRevision.sections = course.activeCourseRevision.sections.map(section => {
        return section.get().lectures.map(lecture => {
          lecture = lecture.get();
          console.log("Hye hey => ", enrolment.completedLectures.includes(lecture.ref));
          if(enrolment.completedLectures.includes(lecture.ref)){
            lecture.completed = true;
          } else {
            lecture.completed = false;
          }
          return lecture;
        });
      });
    }
    course = utils.mergeCourseRevisionData(course);
    return res.send({ success : true, message : "Course retrieved", data: course });

  },
  rateCourse : (req,res,next) => {
    let fieldsValid = utils.validateReqFields(req,res,["rating"]);
    if(fieldsValid){
      let { courseId } = req.params;
      let { rating, review } = req.body;
      if(!(rating <= 5 && rating >= 1)){
        return res.status(400).send({ success : false, message : "Invalid rating provided" });
      }
      Enrolment.findOne({ where : { userId : req.user.uuid, courseId } })
        .then(enrolment => {
          if(enrolment){
            enrolment.rating = rating;
            enrolment.review = review ? review : null;
            enrolment.save()
              .then(updatedEnrolment => {
                res.send({ success : true, message : "Course rating submitted" });
              })
              .catch(next);
          } else {
            return res.status(401).send({ success : false, message : "You can't rate this course" });
          }
        })
        .catch(next);
    }
  },
  deleteRating : (req,res,next) => {
    let { courseId } = req.params;
    Enrolment.findOne({ where : { userId : req.user.uuid, courseId } })
      .then(enrolment => {
        if(enrolment){
          enrolment.rating = null;
          enrolment.review = null;
          enrolment.save()
            .then(updatedEnrolment => {
              res.send({ success: true, message:"Rating deleted" });
            })
            .catch(next);
        } else {
          return res.status(401).send({ success : false, message : "You can't rate this course" });
        }
      })
      .catch(next);
  },
  getFeaturedCourse : async(req,res,next) => {
    let { categoryId } = req.params;
    let category = await Category.findOne({
      where : { uuid : categoryId },
      include : [{ model : Category, as : "subcategories" }]
    });

    if(!category){
      return res.status(404).send({ success : false, message : "Category not found" });
    }
    let categoryIds = [ categoryId ];
    if(category.subcategories){
      let subCategoryIds = category.subcategories.map(category => category.uuid);
      categoryIds = [...categoryIds,...subCategoryIds];
    }
    Course.findOne({
      where: {
        featured : true,
        "$activeCourseRevision.categoryId$": { [Op.in] : categoryIds },
      },
      attributes : constants.course.attributes.list,
      include : constants.course.includes.list
    })
      .then(course => {
        if(course){
          course = utils.mergeCourseRevisionData(course);
          return res.send({ success : true, message : "Course retrieved", data : course });
        } else {
          return res.status(404).send({ success : false, message : "No featured course" });
        }
      })
      .catch(next);
  },

  getRandomFeaturedCourse : async(req,res,next) => {
    let featuredCourses = await Course.findAll({
      where: { featured : true },
      attributes : constants.course.attributes.list,
      include : constants.course.includes.list
    });

    if(!featuredCourses || !featuredCourses.length){
      return res.status(404).send({ success : false, message : "No featured courses" });
    }

    let randomCourse = featuredCourses[Math.floor(Math.random()*featuredCourses.length)];
    randomCourse = utils.mergeCourseRevisionData(randomCourse);

    return res.send({ success: true, message : "Course retrieved", data: randomCourse });
  },

  getTrendingCourses: (req,res,next) => {
    Course.findAll({
      where : {
        "$activeCourseRevision.status$": constants.status.live,
        schoolId: req.school.uuid
      },
      attributes : [
        ...constants.course.attributes.list,
        [Sequelize.literal("(SELECT COUNT(*) FROM views WHERE views.courseId = course.uuid)"), "views"],
      ],
      include : constants.course.includes.list,
      order : Sequelize.literal("views DESC"),
      limit : 10
    })
      .then(courses => {
        courses = courses.map((course) => utils.mergeCourseRevisionData(course));
        res.send({ success : true, message : "Courses retrieved", data : courses });
      })
      .catch(next);
  },
  searchCourses : (req,res,next) => {
    let fieldsValid = utils.validateReqFields(req,res,["query","page"]);
    if(fieldsValid){
      let { query, page, limit } = req.query;
      let searchString = `%${query}%`;
      limit = limit ? limit : constants.course.pagination.limit;

      // @TODO - Make string search in skills [json] case insensitive
      Course.findAndCountAll({
        where : {
          "$activeCourseRevision.status$": constants.status.live,
          schoolId: req.school.uuid,
          [Op.or]: [
            { "$activeCourseRevision.title$": { [Op.like]: searchString } },
            { "$activeCourseRevision.subtitle$": { [Op.like]: searchString } },
            { "$activeCourseRevision.about$": { [Op.like]: searchString } },
            { "$activeCourseRevision.skills$": { [Op.substring]: searchString } }
          ]
        },
        attributes : constants.course.attributes.list,
        include : constants.course.includes.list,
        ...utils.paginate({ page, limit })
      })
        .then(courses => {
          let pages = Math.ceil(courses.count / limit);
          if(courses.rows.length){
            courses.rows = courses.rows.map((course) => utils.mergeCourseRevisionData(course));
            return res.send({ success : true, message : "Courses retrieved", data : courses.rows, count : courses.count, pages });
          } else if(page == 1){
            return res.status(200).send({ success : true, message : "No courses matched your search", data : [] });
          }
          return res.status(200).send({ success : true, message : "No more results", data : [] });
        })
        .catch(next);
    }
  },
  getLiveCourses : (req,res,next) => {
    let fieldsValid = utils.validateReqFields(req,res,["page"]);
    if(fieldsValid){
      let { page, limit } = req.query;
      limit = limit ? limit : constants.course.pagination.limit;
      Course.findAndCountAll({
        where: {
          "$activeCourseRevision.status$": constants.status.live,
          schoolId: req.school.uuid
        },
        attributes : constants.course.attributes.list,
        include : constants.course.includes.list,
        ...utils.paginate({ page, limit })
      })
        .then(courses => {
          let pages = Math.ceil(courses.count / limit);
          if(courses.rows.length){
            courses.rows = courses.rows.map((course) => utils.mergeCourseRevisionData(course));
            return res.send({ success : true, message : "Courses retrieved", data : courses.rows, count : courses.count, pages });
          } else if(page == 1){
            return res.status(200).send({ success : true, message : "No courses found", data : [] });
          }
          return res.status(200).send({ success : true, message : "No more results", data : [] });
        })
        .catch(next);
    }

  },
  delete : (req,res,next) => {
    let { courseId } = req.params;
    Course.findOne({ where : { uuid : courseId } })
      .then(course => {
        course.destroy();
        // @TODO delete all course content
        return res.send({ success : true, message : "Course deleted" });
      })
      .catch(next);
  }

};
