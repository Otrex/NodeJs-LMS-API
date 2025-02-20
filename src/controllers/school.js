const utils = require("../utils");
const {
  school: School,
  user: User,
  setting: Setting,
  schoolAdministrator: SchoolAdministrator
} = require("../config/database/models");

module.exports = {
  createSchool: async(req, res, next) => {
    let fieldsValid = utils.validateReqFields(req, res, ["name","domainName","description"]);
    if(fieldsValid){
      try{
        let { name, domainName, description } = req.body;

        // This whole School set-up queries should be wrapped in a transaction - do this ASAP
        let createdSchool = await School.create({name, domainName, description});

        let createdSchoolAdministrator = await SchoolAdministrator.create({
          dumoAccountId: req.dumoAccountId,
          schoolId: createdSchool.uuid,
          role: "owner"
        });

        let createdSchoolCategories = await utils.createSchoolCourseCategories(createdSchool.uuid);
        let createdSchoolSetting = await Setting.create({ schoolId: createdSchool.uuid });

        if(!createdSchool || !createdSchoolAdministrator || !createdSchoolCategories || !createdSchoolSetting){
          // Again, this isn't right. Wrap the queries in a transaction.
          utils.writeToFile(`[School creation failed] - dumoAccountId: ${req.dumoAccountId}, schoolData - ${req.body.toString()}`);
          return res.status(500).send({success: false, message: "School creation failed"});
        }

        return res.status(201).send({success: true, message: "School created successfully", data: createdSchool});
      } catch(e){
        next(e);
      }
    }
  },
  getSchools: async(req, res, next) => {
    try{
      let schools = await School.findAll({
        include:[{
          model: SchoolAdministrator,
          where: {dumoAccountId: req.dumoAccountId}
        }]
      });
      if(schools){
        // schools = schools.map(school => school.setDataValue('schoolAdministrators',null));
        return res.send({success: true, message: "Schools retrieved successfully",data: schools});
      } else {
        return next("Schools could not be retrieved");
      }
    } catch(e){
      next(e);
    }
  },
  getSchool: async(req, res, next) => {
    try{
      let schoolAdmin = await SchoolAdministrator.findOne({
        where: {
          schoolId: req.school.uuid,
          dumoAccountId: req.dumoAccountId
        }
      });

      if(!schoolAdmin){
        return res.status(401).send({success: false, message: "You are not an administrator of this school"});
      }
      return res.send({success: true, message: "School data retrieved successfully", data: req.school});
    } catch(e){
      next(e);
    }
  },

  updateSchool: async(req, res, next) => {
    for(let field in req.body){
      req.school[field] = req.body[field];
    }

    req.school.save()
    .then(updatedSchool => {
      res.send({success: true, message: 'School updated successfully', data: updatedSchool});
    })
    .catch(next);
  },

  getMetaData: (req, res, next) => {
    let { SPACES_ENDPOINT, SPACES_BUCKET_NAME } = process.env;
    let metaData = {
      assetsBaseUrl: `https://${SPACES_BUCKET_NAME}.${SPACES_ENDPOINT}`
    };

    return res.send({success: true, message: 'Meta data retrieved successfully', data: metaData});
  }
};