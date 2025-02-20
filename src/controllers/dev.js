const { user:User, course:Course } = require("../config/database/models");
const utils = require("../utils");

module.exports = {
  enrol : (req,res,next) => {
    let { courseId } = req.params;

    Course.findOne({ where : { uuid : courseId } })
      .then(async(course) => {
        if(!course){
          return res.status(404).send({ success : false, message : "Course not found" });
        }
        let enrolmentSuccessful = await utils.enrolUserIntoCourse(req.user.uuid, courseId);
        if(enrolmentSuccessful){
          return res.send({ success : true, message : "Enrolment successful" });
        } else {
          return res.status(500).send({ success : false, message : "Enrolment failed" });
        }
      })
      .catch(next);
  }
};