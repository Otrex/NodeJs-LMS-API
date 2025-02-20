const utils = require("../utils");
const multer = require("multer");
const path = require("path");
const jwksClient = require("jwks-rsa");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const {
  course: Course,
  courseRevision: CourseRevision,
  section: Section,
  lecture: Lecture,
  user: User,
  school: School,
  schoolAdministrator: SchoolAdministrator
} = require("../config/database/models");

module.exports = {
  errorHandler: (error, req, res,next) => {
    utils.writeToFile(error);
    console.log(error.stack);

    if(error instanceof multer.MulterError){
      let errorMessage = error.message.replace("MulterError:","File upload error: ");
      return res.status(400).send({ success : false, message : errorMessage });
    }
    // utils.sendMail("adimvicky@gmail.com","Acadabay server Error",`${error.toString()}`);
    res.status(500).send({ success: false, message: "A server error occurred", error: error.toString() });
  },
  findSchool: async(req, res, next) => {
    try{
      let whereClause = {};
      let { schoolId } = req.params;
      if(schoolId){
        whereClause = { uuid: schoolId };
      } else {
        const schoolUrl = req.get("origin") ? req.get("origin").replace("http://", "https://") : `https://${req.get("x-platform-domain")}`;
        whereClause = {
          domainName: schoolUrl
        };
      }

      let school = await School.findOne({ where: whereClause });
      if(!school){
        return res.status(404).send({ success: false, message: "School not found" });
      }
      req.school = school;
      return next();
    } catch(e){
      next(e);
    }
  },
  endpointNotFoundHandler: (req,res,next) => {
    res.status(404).send({ success: false,message:"API endpoint not found -" });
  },
  isDumoAuthenticated: async(req,res,next) => {
    try{
      let { authorization } = req.headers;
      if (!authorization) return res.status(401).json({ success: false, message: "You must be logged in to do that (No authorization sent)" });
      let accessToken = authorization.split(" ")[1];

      var client = jwksClient({
        jwksUri: "https://accounts.dumo.cloud/.well-known/jwks.json"
      });

      function getKey(header, callback){
        client.getSigningKey(header.kid, function(err, key) {
          if(err){
            next(err);
          }
          let signingKey = key.publicKey || key.rsaPublicKey;
          callback(null, signingKey);
        });
      }

      jwt.verify(accessToken, getKey, {}, async(err, decodedToken) => {
        if(err){
          console.log(err);
          return res.status(401).json({ success: false, message: "Authorization invalid. Please log in." });
        }
        console.log("Decoded dumo access_token => ", decodedToken);
        if(decodedToken && decodedToken.sub){
          req.dumoAccountId = decodedToken.sub;
          req.user = await User.scope("withHiddenFields").findOne({ where: {
            dumoAccountId: decodedToken.sub,
            schoolId: req.school ? req.school.uuid : null
          } });

          if (!req.user.email) {
            req.user.email = decodedToken.email
            await req.user.save()
          }

          return next();
        } else {
          return res.status(401).json({ success: false, message: "Authorization invalid. Please log in." });
        }
      });
    } catch(e){
      next(e);
    }
  },
  isSchoolAdmin: async(req, res, next) => {
    let administrator = await SchoolAdministrator.findOne({ where: {
      dumoAccountId: req.dumoAccountId,
      schoolId: req.school.uuid
    }
    });

    if(!administrator){
      return res.status(401).send({ success: false, message: "You an not an administrator of this school" });
    }
    return next();
  },
  isDumoAuthorized: async(req, res, next) => {
    let { schoolId, courseId, sectionId, lectureId } = req.params;
    let user = await User.findOne({ where: { dumoAccountId: req.dumoAccountId, schoolId } });
    if(!user){
      return res.status(404).send({ success: false, message: "School instructor account not found" });
    }
    if(courseId){
      let course = await Course.findOne({ where: { uuid: courseId, schoolId } });
      if(!course){
        return res.status(404).send({ success : false, message : "Course not found" });
      }
      if(course.creatorId === user.uuid){
        return next();
      } else {
        return res.status(401).send({ success : false, message : "Request unauthorized" });
      }
    }

    if(lectureId){
      let lecture = await Lecture.findOne({
        where: { uuid: lectureId },
        include: [{ model: CourseRevision, include: { model: Course } }]
      });

      if(!lecture){
        return res.status(404).send({ success : false, message : "Lecture not found" });
      }
      if(lecture.courseRevision.course.creatorId === user.uuid){
        return next();
      } else {
        return res.status(401).send({ success : false, message : "Request unauthorized" });
      }
    }

    if(sectionId){
      let section = await Section.findOne({
        where : { uuid :sectionId },
        include : [{ model: CourseRevision, include: [Course] }]
      });

      if(!section){
        return res.status(404).send({ success : false, message : "Section not found" });
      }
      if(section.courseRevision.course.creatorId === user.uuid){
        return next();
      } else {
        return res.status(401).send({ success : false, message : "Request unauthorized" });
      }
    }
  },
  isAuthenticated : async(req,res,next) => {
    const { authorization } = req.headers;
    if (!authorization) return res.status(401).json({ success: false, message: "You must be logged in to do that (No authorization sent)" });
    let token = authorization.split(" ")[1];

    try {
      let decodedToken = await utils.verifyAuthToken(token);
      if(!decodedToken) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      req.user = await User.scope("withHiddenFields").findOne({
        where: {
          uuid: decodedToken.userId,
          schoolId: req.school.uuid
        }
      });
      if(req.user){
        return next();
      } else {
        return res.status(404).send({ success : false, message : "User not found" });
      }
    } catch(e){
      return res.status(401).json({ success: false, message: "Authorization invalid. Please log in." });
    }
  },
  isAuthorized : (req,res,next) => {
    let { courseId, sectionId, lectureId } = req.params;
    const isAdmin = (req) => req.user.role === "admin" || req.user.role === "superadmin";
    // Authorize course owner
    if(courseId){
      Course.findOne({ where : { uuid : courseId } })
        .then(course => {
          if(course){
            if((course.creatorId == req.user.uuid) || isAdmin(req)){
              console.log(course.creatorId, req.user.uuid, isAdmin(req));
              return next();
            } else {
              return res.status(401).send({ success : false, message : "Request unauthorized" });
            }
          } else {
            return res.status(404).send({ success : false, message : "Course not found" });
          }
        })
        .catch(next);
    }

    if(lectureId){
      Lecture.findOne({
        where : { uuid : lectureId },
        include : [{ model : Section,
          include : [{
            model: CourseRevision,
            include: { model: Course }
          }]
        }]
      })
        .then(lecture => {
          if(lecture){
            if((lecture.section.courseRevision.course.creatorId == req.user.uuid) || isAdmin(req)){
              return next();
            } else {
              return res.status(401).send({ success : false, message : "Request unauthorized" });
            }
          } else {
            return res.status(404).send({ success : false, message : "Lecture not found" });
          }
        })
        .catch(next);
    }

    if(sectionId){
      Section.findOne({
        where : { uuid :sectionId },
        include : [{
          model: CourseRevision,
          include: [Course]
        }]
      })
        .then(section => {
          if(section){
            if((section.courseRevision.course.creatorId === req.user.uuid) || isAdmin(req)){
              return next();
            } else {
              return res.status(401).send({ success : false, message : "Request unauthorized" });
            }
          } else {
            return res.status(404).send({ success : false, message : "Lecture not found" });
          }
        })
        .catch(next);
    }
  },
  isAdmin: (req,res,next) => {
    if(req.user.role === "admin" || req.user.role == "superadmin"){
      return next();
    } else {
      return res.status(401).send({ success : false, message : "Request unauthorized" });
    }
  },
  isSuperAdmin: (req,res,next) => {
    if(req.user.role === "superadmin"){
      return next();
    } else {
      return res.status(401).send({ success : false, message : "Request unauthorized" });
    }
  },
  fileStorage: (acceptedFileExtensions=[]) => {
    let diskStorage = multer.diskStorage({
      destination : (req,file,cb) => {
        cb(null, path.join(__dirname, "../../media"));
      },
      filename : (req,file,cb) => {
        console.log(file);
        cb(null,`${Date.now()}-${file.originalname}`);
      }
    });

    return multer({
      storage : diskStorage,
      limits : { fileSize : 314572800 },
      fileFilter : (req,file,callback) => {
        if(!acceptedFileExtensions.length){
          return callback(null, true);
        }
        let uploadedFileExtension = path.extname(file.originalname).substr(1);
        console.log(uploadedFileExtension);
        if(acceptedFileExtensions.includes(uploadedFileExtension)){
          return callback(null, true);
        }
        return callback(new Error(`File extension ".${uploadedFileExtension}" not allowed.`));
      }
    }).single("media");

  }
};
