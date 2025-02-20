const utils = require("../utils");
const path = require("path");
const { Op } = require("sequelize");
const { status, lectureContentTypes } = require("../config/constants");
const {
  lecture:Lecture,
  media:Media,
  course:Course,
  courseRevision: CourseRevision,
  section:Section,
  enrolment: Enrolment,
  lectureContent: LectureContent
} = require("../config/database/models");
const { enrol } = require("./dev");
const { v4: uuidv4, validate: uuidValidate } = require("uuid");


module.exports = {
  create : async(req,res,next) => {
    let fieldsValid = utils.validateReqFields(req,res,["title"]);
    if(fieldsValid){
      let { sectionId } = req.params;
      let { title } = req.body;
      try{
        let section = await Section.findOne({
          where: { uuid: sectionId },
          include: [{
            model: CourseRevision,
            include: [{ model: Course }]
          }]
        });

        if(!section){
          return res.status(404).send({ success: false, message: "Section not found" });
        }
        console.log('Section => ',section)

        if(!(section.courseRevision.course.creatorId === req.user.uuid)){
          return res.status(401).send({ success : false, message : "Request unauthorized - course doesn't belong to this user" });
        }
        if(["review","live"].includes(section.courseRevision.status)){
          return res.status(403).send({ success: false, message: "This course can't be updated" });
        }

        let createdLecture = await Lecture.create({
          title,
          sectionId,
          courseRevisionId: section.courseRevision.uuid
        });

        if(!createdLecture){
          return res.status(500).send({success: false, message: "Lecture creation failed"});
        }
        return res.send({ success: true, message: "Lecture created", data: createdLecture });
      } catch(e){
        next(e);
      }
    }
  },
  update: async(req,res,next) => {
    let fieldsValid = utils.validateReqFields(req,res);
    if(fieldsValid){
      try{
        let { lectureId } = req.params;
        let lecture = await Lecture.findOne({
          where: { uuid: lectureId },
          include: [{ model: CourseRevision }]
        });

        if(!lecture){
          return res.status(404).send({ success : false, message : "Lecture not found" });
        }

        if(["review","live"].includes(lecture.courseRevision.status)){
          return res.status(403).send({ success: false, message: "This course can't be updated" });
        }

        for(let field in req.body){
          lecture[field] = req.body[field];
        }

        let updatedLecture = await lecture.save();
        if(!updatedLecture){
          return res.status(500).send({success: false, message: "Lecture update failed"});
        }
        return res.send({ success: true, message: "Lecture updated successfully", data: updatedLecture });
      } catch(e){
        next(e);
      }
    }
  },
  delete: async(req,res,next) => {
    try{
      let { lectureId } = req.params;
      let lecture = await Lecture.findOne({
        where: {uuid: lectureId },
        include: [{ model: CourseRevision }]
      });

      if(!lecture){
        return res.status(404).send({ success : false, message : "Lecture not found" });
      }

      if(["review","live"].includes(lecture.courseRevision.status)){
        return res.status(403).send({ success: false, message: "This course can't be updated" });
      }

      await lecture.destroy({ individualHooks : true });
      // @TODO delete lecture video
      return res.send({ success: true, message: "Lecture deleted" });
    } catch(e){
      next(e);
    }
  },
  updateVideo : (req,res,next) => {
    let fieldsValid = utils.validateReqFields(req,res,["url"]);
    if(fieldsValid){
      let { lectureId } = req.params;
      Lecture.findOne({ where : { uuid : lectureId }, include : [{ model : Media, as : "video" }] })
        .then(lecture => {
          if(lecture){
            if(lecture.video){
              lecture.video.url = req.body.url;
              lecture.video.save()
                .then(lecture => {
                  // @TODO Delete lecture video
                  res.send({ success : true, message : "Lecture video updated",data : lecture });
                })
                .catch(next);
            } else {
              return res.status(404).send({ success : false, message : "Lecture video not found" });
            }
          } else {
            return res.status(404).send({ success : false, message : "Lecture not found" });
          }
        })
        .catch(next);
    }
  },
  courseLectureCompleted : async(req,res,next) => {
    let { lectureId } = req.params;
    try {
      let lecture = await Lecture.findOne({
        where: { uuid: lectureId },
        include: [{
          model: Section,
          include: [{
            model: CourseRevision,
            include: [{ model: Course }]
          }]
        }]
      });

      if(!lecture){
        return res.status(404).send({ success : false, message : "Lecture not found" });
      }

      let enrolment = await Enrolment.findOne({
        where: {
          userId: req.user.uuid,
          courseId : lecture.section.courseRevision.course.uuid
        }
      });

      if(!enrolment){
        return res.status(404).send({ success: false, message: "Enrolment not found" });
      }

      if(Array.isArray(enrolment.completedLectures)){
        if(!enrolment.completedLectures.includes(lecture.ref)){
          enrolment.completedLectures.push(lecture.ref);
        }
      } else {
        enrolment.completedLectures = [ lecture.ref ];
      }

      Enrolment.update({
        completedLectures: enrolment.completedLectures },{
        where: { uuid: enrolment.uuid }
      })
        .then(() => {
          return res.send({ success : true, message : "Lecture completed successfully" });
        })
        .catch(next);
    } catch(e){
      next(e);
    }
  },

  /* Lecture content */
  createSpacesContent: async(req, res, next) => {
    try{
      let fieldsValid = utils.validateReqFields(req, res, ["lectureContentType","type"]);
      if(fieldsValid){
        let { lectureId } = req.params;
        let { lectureContentType, type } = req.body;

        let lecture = await Lecture.findOne({
          where: {uuid: lectureId},
          include: [{model: CourseRevision}]
        });

        if(!lecture){
          return res.status(404).send({success: false, message: "Lecture not found"});
        }

        if(["review","live"].includes(lecture.courseRevision.status)){
          return res.status(403).send({success: false, message: "This course can't be updated"});
        }

        let createdContent = await LectureContent.create({
          type: lectureContentType,
          content: uuidv4(),
          lectureId,
          courseRevisionId: lecture.courseRevision.uuid
        });

        if(!createdContent){
          return res.status(500).send({success: false, message: "Lecture content creation failed"});
        }
        let url = utils.spaces.createUploadUrl(createdContent.content, type);
        return res.send({success: true, message: "Content created successfully", data: { createdContent, url, type }});
      }

    } catch(e){
      next(e);
    }

  },
  createContent: async(req, res, next) => {
    try{
      let fieldsValid = utils.validateReqFields(req, res, ["lectureContentType"]);
      if(fieldsValid){
        let { lectureId } = req.params;

        let lecture = await Lecture.findOne({
          where: {uuid: lectureId},
          include: [{model: CourseRevision}]
        });

        if(!lecture){
          return res.status(404).send({success: false, message: "Lecture not found"});
        }

        if(["review","live"].includes(lecture.courseRevision.status)){
          return res.status(403).send({success: false, message: "This course can't be updated"});
        }

        let { lectureContentType, content, externalLink, file: fileObj } = req.body;
        let name = null;
        let size = 0;

        if(lectureContentType === "note"){
          if(!content){
            return res.status(400).send({success: false, message: "Lecture content note not provided"});
          }
        } else if(["video","audio","pdf"].includes(lectureContentType)){

          if(["video","audio"].includes(lectureContentType)){
            let existingAudioOrVideoContent = await LectureContent.findOne({where:{
              lectureId,
              type: {[Op.in]: ["video","audio"]}
            }});
            if(existingAudioOrVideoContent){
              return res.status(400).send({success: false, message: "An audio/video content already exists in this lecture"});
            }
          }

          if(!fileObj && !externalLink){
            return res.status(400).send({success: false, message: "No file provided"});
          }
          if(fileObj){
          	if(!fileTypeAndProvidedTypeMatch(fileObj, lectureContentType)){
            	return res.status(400).send({success: false, message: "The provided file type and uploaded file type do not match"});
          	}
            content = utils.spaces.createObjectReference('lecture-contents'); // DO Spaces reference
            name = fileObj.name;
            size = (fileObj.size / 1024); // File size in Kilobytes
          } else {
            content = externalLink;
            name = externalLink;
          }

        } else {
          return res.status(500).send({success: false, message: "Lecture content type could not be determined"});
        }
        let createdContent = await LectureContent.create({
          type: lectureContentType,
          content,
          lectureId,
          name,
          size,
          courseRevisionId: lecture.courseRevision.uuid
        });
        if(!createdContent){
          return res.status(500).send({success: false, message: "Lecture content creation failed"});
        }

        let response = {success: true, message: "Content created successfully", data: createdContent};
        if(fileObj && !externalLink){
          response.uploadUrl = utils.spaces.createUploadUrl(createdContent.content, fileObj.type);
        }
        return res.status(201).send(response);
      }
    } catch(e){
      next(e);
    }
  },
  updateContent: async(req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res);
    if(fieldsValid){
      let { contentId } = req.params;
      let { content, externalLink, file: fileObj } = req.body;
      let name = null;
      let size = 0;

      let lectureContent = await LectureContent.findOne({
        where: {uuid: contentId },
        include: [{model: CourseRevision}]
      });

      if(!lectureContent){
        return res.status(404).send({success: false, message: "Lecture content not found"});
      }
      if(["review","live"].includes(lectureContent.courseRevision.status)){
        return res.status(403).send({success: false, message: "This course can't be updated"});
      }

      if(lectureContent.type === "note"){
        if(!content){
          return res.status(400).send({success: false, message: "Lecture content note not provided"});
        }
      } else if(["video","audio","pdf"].includes(lectureContent.type)){
        if(!fileObj && !externalLink){
          return res.status(400).send({success: false, message: "No file provided"});
        }
        if(fileObj){
          if(!fileTypeAndProvidedTypeMatch(fileObj, lectureContent.type)){
            return res.status(400).send({success: false, message: "The type of this content and the uploaded file type do not match"});
          }
            content = utils.spaces.createObjectReference('lecture-contents'); // DO Spaces reference
            name = fileObj.name;
            size = (fileObj.size / 1024);
          } else {
            content = externalLink;
            name = externalLink;
          }
        } else {
        return res.status(500).send({success: false, message: "Lecture content type could not be determined"});
      }

      lectureContent.content = content;
      lectureContent.name = name;
      lectureContent.size = size;
      let updatedLectureContent = await lectureContent.save();
      if(!updatedLectureContent){
        return res.status(500).send({success: false, message: "Lecture content update failed"});
      }

      let response = {success: true, message: "Content created successfully", data: updatedLectureContent};

      if(fileObj && !externalLink){
        // @TODO Delete former file from DO space
        response.uploadUrl = utils.spaces.createUploadUrl(updatedLectureContent.content, fileObj.type);
      }
      return res.send(response);
    }
  },
  deleteContent: async(req, res, next) => {
    let { contentId } = req.params;
    let lectureContent = await LectureContent.findOne({
      where: {uuid: contentId},
      include: [{model: CourseRevision}]
    });

    if(!lectureContent){
      return res.status(404).send({success: false, message: "Lecture content not found"});
    }

    if(["review","live"].includes(lectureContent.courseRevision.status)){
      return res.status(403).send({success: false, message: "This course can't be updated"});
    }

    lectureContent.destroy({individualHooks: true})
    .then(() => {
      let contentFileIsInObjectStorage = uuidValidate(lectureContent.content);
      if(contentFileIsInObjectStorage){
        utils.spaces.deleteObject(lectureContent.content)
      }
      return res.send({success: true, message: "Lecture content deleted successfully"});
    })
    .catch(next);
  },

  changeLectureContentOrder: async(req, res, next) => {

  }
};





function fileTypeAndProvidedTypeMatch(file, providedType){
  let audioFormats = ["mp3","ogg","webm"];
  let videoFormats = ["mp4"];
  let textFileFormats = ["pdf"]

  let fileExtension = path.extname(file.name).substr(1);
  if(providedType === "audio" && audioFormats.includes(fileExtension)){
    return true;
  }
  if(providedType === "video" && videoFormats.includes(fileExtension)){
    return true;
  }
  if(providedType === "pdf" && textFileFormats.includes(fileExtension)){
    return true;
  }
  return false;
}