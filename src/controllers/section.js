const utils = require("../utils");
const { status } = require("../config/constants");

const {
  section:Section,
  course:Course,
  courseRevision: CourseRevision
} = require("../config/database/models");

module.exports = {
  create: async(req,res,next) => {
    let fieldsValid = utils.validateReqFields(req,res,["title","learningObjective","courseId"]);
    if(fieldsValid){
      try{
        let { title, learningObjective, courseId } = req.body;

        let course = await Course.findOne({
          where: { uuid: courseId },
          include: [{ model: CourseRevision, as: "courseRevisions" }]
        });

        if(!course){
          return res.status(404).send({ success: false, message : "Course not found" });
        }
        if(!(course.creatorId === req.user.uuid)){
          return res.status(401).send({ success: false, message : "Request unauthorized - course doesn't belong to this user" });
        }

        let revisionUnderReview = course.courseRevisions.find((revision) => revision.status === "review");
        if(revisionUnderReview){
          return res.status(403).send({ success: false, message :"This course is being review and so can't be updated" });
        }

        let courseRevisionToUpdate = course.courseRevisions.find((revision) => ["draft","disapproved"].includes(revision.status))
        if(!courseRevisionToUpdate){
          return res.status(500).send({ success: false, message: "Something went wrong - Course update failed" });
        }

        Section.create({
          courseRevisionId: courseRevisionToUpdate.uuid,
          title,
          learningObjective
        })
          .then(section => {
            res.send({ success: true, message: "Section created successfully", data: section.get() });
          })
          .catch(next);
      } catch(e){
        next(e);
      }
    }
  },
  update: async(req,res,next) => {
    let fieldsValid = utils.validateReqFields(req,res);
    if(fieldsValid){
      let { sectionId } = req.params;

      let section = await Section.findOne({
        where: { uuid: sectionId },
        include: [ CourseRevision ]
      });

      if(!section){
        return res.status(404).send({ success: false, message: "Section not found" });
      }
      if(["review","live"].includes(section.courseRevision.status)){
        return res.status(401).send({ success : false, message: "This course can't be updated" });
      }
      for(let field in req.body){
        section[field] = req.body[field];
      }

      section.save()
        .then(section => {
          return res.send({ success: true, message: "Section updated successfully", data: section });
        })
        .catch(next);
    }
  },
  delete: async(req,res,next) => {
    try{
      let { sectionId } = req.params;
      let section = await Section.findOne({
        where: {uuid: sectionId },
        include: [{ model: CourseRevision }]
      })

      if(!section){
        return res.status(404).send({ success : false, message : "Section not found" });
      }
      if(["review","live"].includes(section.courseRevision.status)){
        return res.status(403).send({ success: false, message: "This course can't be updated" });
      }
      await section.destroy({ individualHooks : true });
      return res.send({ success : true, message : "Section deleted" });
    } catch(e){
      next(e);
    }
  }
};