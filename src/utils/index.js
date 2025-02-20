const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const sendgridMail = require("@sendgrid/mail");
sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);
const Validator = require("fastest-validator");
const slugify = require("slugify");
const { v4: uuidv4 } = require("uuid");
const request = require("request-promise");
const axios = require("axios");
var jwksClient = require("jwks-rsa");
const homePageBaseUrl = "https://dumo.cloud/apps/lms";
const dumoAccountsUrl = "https://accounts.dumo.cloud";

// Payment provider key hashing
const crypto = require("crypto");
const { Op } = require("sequelize");
const cryptoIv = Buffer.alloc(16, 0);
const cryptoAlgo = "aes-192-cbc";
let cryptoKey = process.env.PAYMENT_PROVIDER_KEY_HASH_KEY;
cryptoKey = crypto.createHash("sha256").update(String(cryptoKey)).digest("base64").substr(0, 32);
cryptoKey = Buffer.from(cryptoKey, "base64");

// Object storage - Digital ocean spaces
const AWS = require("aws-sdk");
const spacesEndpoint = new AWS.Endpoint(process.env.SPACES_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET_KEY
});

//MonnifyDetails
const monnifyApiUrl = "https://sandbox.monnify.com";
const monnifyApiKey = process.env.MONNIFY_API_KEY;
const monnifyContractCode = process.env.MONNIFY_CONTRACT_CODE;
const monnifySecretKey = process.env.MONNIFY_SECRET_KEY;
let encodedMonnifyCredentials = Buffer.from(`${monnifyApiKey}:${monnifySecretKey}`).toString("base64");

const utils = {
  validateReqFields: (req, res, requiredFields = []) => {
    // Field types and format validation
    let validator = new Validator();
    let types = {
      string: {
        type: "string",
        trim: true
      },
      date: {
        type: "date",
        convert: true,
      },
      array: {
        type: "array",
        items: "string"
      },
      number: {
        type: "number"
      },
      forbidden: {
        type: "forbidden",
        remove: true
      }
    };
    let { string, date, array, number, forbidden } = types;
    let schema = {
      // Category
      name: { ...string },
      // Course
      title: { ...string },
      subtitle: { ...string },
      about: { ...string },
      requirements: { ...array },
      learningOutcomes: { ...array },
      skills: { ...array },
      currency: { type: "enum", values: ["NGN", "USD"] },
      amount: { ...number },
      welcomeMessage: { ...string },
      congratulatoryMessage: { ...string },
      adminFeedback: { ...string },
      // Enrolment
      rating: { ...number },
      review: { ...string },
      // Lecture
      text: { ...string },
      lectureContentType: { type: "enum", values: ["video", "audio", "note", "pdf"] },
      // Section
      learningObjective: { ...string },
      // Transactions
      paymentGateway: { ...string },
      firstName: { ...string },
      lastName: { ...string },
      email: { type: "email", normalize: true },
      password: { ...string },
      tagline: { ...string },
      // Forbidden fields
      role: { ...forbidden },
      status: { ...forbidden },
      emailVerified: { ...forbidden },
      coursePricePercentage: { ...number },
      bankName: { ...string },
      bankAccountName: { ...string },
      bankAccountNumber: { ...string },
      bankCode: { ...string }
    };
    for (let field in schema) {
      schema[field] = { ...schema[field], optional: true };
    }
    console.log("Before validate => ", req.body);
    let check = validator.compile(schema);
    let result = check(req.body);

    console.log("After validate => ", req.body);
    if (result === true) {
      // Required fields' validation
      for (const field of requiredFields) {
        if (!req.body[field] && !req.query[field]) {
          (() => res.status(400).send({ success: false, message: `${field} not provided` }))();
          return false;
        }
      }
      return true;
    } else {
      (() => res.status(400).send({ success: false, message: result[0].message }))();
      return false;
    }
  },
  hashPassword: async (password) => {
    return bcrypt.hash(password, 10);
  },
  comparePasswords: async (inputPassword, hashedPassword) => {
    return bcrypt.compare(inputPassword, hashedPassword);
  },
  signAuthToken: (tokenData) => {
    return jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: "14 days" });
  },
  verifyAuthToken: (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
  },
  getDumoAccountInfo: async (accessToken) => {
    try {
      let userInfo = await request.get({
        url: `${dumoAccountsUrl}/userinfo`,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        json: true
      });

      console.log("Dumo Account info => ", userInfo);

      if (!userInfo || !userInfo.first_name) {
        return null;
      }
      return userInfo;
    } catch (e) {
      utils.writeToFile(e);
      return null;
    }
  },
  createInstructorAccount: async (accessToken, dumoAccountId, schoolId) => {
    const { user: User } = require("../config/database/models");
    let instructor = await User.findOne({ where: { dumoAccountId, schoolId } });

    if (instructor) {
      return instructor;
    } else {
      let dumoAccountInfo = await utils.getDumoAccountInfo(accessToken);
      instructor = await User.create({
        schoolId,
        dumoAccountId: dumoAccountInfo.sub,
        firstName: dumoAccountInfo.first_name,
        lastName: dumoAccountInfo.last_name
      });
      return instructor;
    }
  },
  writeToFile: (text, filePath) => {
    let errorWithTimeStamp = `\n\n${new Date().toDateString()} ${new Date().toTimeString()} => ${text}`;
    console.log(errorWithTimeStamp);
  },
  paginate: ({ page, limit }) => {
    limit = limit ? Number(limit) : 20;
    let offset = limit * (page - 1);
    return {
      offset,
      limit,
      order: [["createdAt", "DESC"]]
    };
  },
  generateToken: () => {
    return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      let r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },
  createSlug: (string) => {
    return slugify(string + " " + `${uuidv4().substr(0, 5)}`, {
      lower: true,
      replacement: "-"
    });
  },
  createReferralCode: () => {
    return uuidv4().substr(0, 8);
  },
  sendMail: async (to, subject, html) => {
    // @TODO Make these mails better-looking, use sendgrid mail templates
    try {
      let mailInfo = await sendgridMail.send({
        from: {
          email: "lms@dumo.cloud",
          name: "DUMO LMS"
        },
        to,
        subject,
        html
      });
      return mailInfo;
    } catch (err) {
      utils.writeToFile(err);
    }
  },
  sendEmailVerificationMail: (email, token) => {
    return utils.sendMail(email, "Your Dumo LMS email verification",
      `<p>
        Hello there! Welcome to Acadabay.
        Please click the link to verify your mail
        <a href="${homePageBaseUrl}/verify/${token}">Verfiy my mail</a>
      </p>`
    );
  },
  sendPasswordResetMail: (email, token, school) => {
    return utils.sendMail(email, "Your Dumo LMS account password reset",
      `<p>
        You requested a password reset on your ${school.name} account. Click the link for further directives
        <a href="${school.domainName}/reset-password/${token}">Reset my password</a>
      </p>`
    );
  },
  getModelByIdType: (idType) => {
    const models = require("../config/database/models");

    let modelName = idType.slice(0, -2);
    let model = models[modelName];

    return model ? model : null;
  },
  incrementCourseViews: (courseId, requestIp) => {
    const models = require("../config/database/models");

    models.view.findOrCreate({
      where: {
        ip: requestIp,
        courseId
      }
    })
      .then(view => {
        console.log(`View created => ${view[0].get()}`);
      })
      .catch(utils.writeToFile);
  },
  enrolUserIntoCourse: async (userId, schoolId, courseId, transactionId) => {
    const models = require("../config/database/models");

    try {
      let whereClause = { userId, courseId, schoolId };
      const enrolled = await models.enrolment.findOne({ where: whereClause });
      if (enrolled) {
        return false;
      }
      if (transactionId) {
        whereClause.transactionId = transactionId;
      }
      let createdEnrolment = await models.enrolment.findOrCreate({ where: whereClause });
      if (createdEnrolment) {
        console.log(`User ${userId} enrolled into course ${courseId} via transaction ${transactionId} => ${createdEnrolment.toString()}`);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      utils.writeToFile(`An error occurred enrolling user - ${userId} into course ${courseId} => ${e.toString()}`);
      return false;
    }
  },
  encryptAPIKey: (apiKey) => {
    const cipher = crypto.createCipheriv(cryptoAlgo, cryptoKey, cryptoIv);
    let encryptedKey = cipher.update(apiKey, "utf8", "hex") + cipher.final("hex");

    return encryptedKey;
  },
  decryptAPIKey: (encryptedKey) => {
    const decipher = crypto.createDecipheriv(cryptoAlgo, cryptoKey, cryptoIv);
    let decryptedKey = decipher.update(encryptedKey, "hex", "utf8") + decipher.final("utf8");

    return decryptedKey;
  },
  convertKoboToNaira: (kobo) => {
    return kobo / 100;
  },
  convertNairaToKobo: (naira) => {
    return naira * 100;
  },
  removeUniqueFieldsFromRecord: (data) => {
    let uniqueFields = ["uuid", "status", "createdAt", "updatedAt", "deletedAt"];

    for (let field in data) {
      if (isObject(data[field])) {
        utils.removeUniqueFieldsFromRecord(data[field]);
      } else {
        if (uniqueFields.includes(field)) {
          delete data[field];
        }
      }
      return data;
    }

    function isObject(obj) {
      return obj != null && obj.constructor.name === "Object";
    }
  },

  mergeCourseRevisionData: (course) => {
    const { course: Course, courseRevision: CourseRevision } = require("../config/database/models/index");

    let courseData = course;
    let activeCourseRevisionData = course.activeCourseRevision || course.getDataValue("activeCourseRevision");

    if (course instanceof Course) {
      courseData = course.get();
    }
    if (activeCourseRevisionData instanceof CourseRevision) {
      activeCourseRevisionData = activeCourseRevisionData.get();
    }

    let revisionFieldsToRemove = ["uuid", "createdAt", "updatedAt", "deletedAt"];

    for (let field of revisionFieldsToRemove) {
      if (activeCourseRevisionData[field]) {
        delete activeCourseRevisionData[field];
      }
    }

    course = {
      ...courseData,
      ...activeCourseRevisionData
    };

    delete course["activeCourseRevision"];
    delete course["courseRevisions"];

    return course;
  },

  createNewCourseRevision: async (courseId) => {
    let {
      course: Course,
      courseRevision: CourseRevision,
      section: Section,
      lecture: Lecture,
      lectureContent: LectureContent,
      media: Media,
      category: Category
    } = require("../config/database/models");

    let attributes = { exclude: ["uuid", "status", "slug", "createdAt", "updatedAt"] };
    let attributesWithoutSlug = { exclude: ["uuid", "status", "createdAt", "updatedAt"] };

    let course = await Course.findOne({
      where: { uuid: courseId },
      include: {
        model: CourseRevision,
        as: "activeCourseRevision",
        attributes: attributesWithoutSlug,
        include: [
          { model: Media, as: "image", attributes },
          {
            model: Section, attributes,
            include: {
              model: Lecture, attributes,
              include: { model: LectureContent, attributes }
            }
          },
          {
            model: Category, attributes,
            include: [{ model: Category, attributes, as: "parentCategory" }]
          },
        ]
      }
    });

    let courseData = course.toJSON();

    if (!course) {
      return null;
    }

    console.log("Course data => ", JSON.stringify(courseData));

    let lectures = course.activeCourseRevision.sections.map(section => section.lectures).flat();
    let lectureContents = lectures.map(lecture => lecture.lectureContents).flat();

    let lectureRefs = lectures.map(lecture => lecture.ref);
    let lectureContentRefs = lectureContents.map(content => content.ref);

    console.log("lectureIds => ", lectureRefs);
    console.log("Lecture content ids => ", lectureContentRefs);

    let newCourseRevision = await CourseRevision.create({
      ...courseData.activeCourseRevision,
    }, {
      include: [
        { association: CourseRevision.MediaAssoc },
        {
          association: CourseRevision.SectionAssoc,
          include: {
            association: Section.LectureAssoc,
            include: {
              association: Lecture.LectureContentAssoc
            }
          }
        },
        { association: CourseRevision.CategoryAssoc }
      ]
    });

    if (!newCourseRevision) {
      return null;
    }

    let lecturesUpdated = await Lecture.update({
      courseRevisionId: newCourseRevision.uuid
    }, {
      where: { ref: { [Op.in]: lectureRefs } }
    });

    let lectureContentsUpdated = await LectureContent.update({
      courseRevisionId: newCourseRevision.uuid
    }, {
      where: { ref: { [Op.in]: lectureContentRefs } }
    });

    console.log(lecturesUpdated, lectureContentsUpdated);

    // if(lecturesUpdated && lectureContentsUpdated){

    // }

    return newCourseRevision;
  },

  setInstructorRevision: (course) => {
    let revisionToShow;
    let revisionNotLive = course.courseRevisions.find((revision) => ["draft", "review", "disapproved"].includes(revision.status));
    if (revisionNotLive) {
      revisionToShow = revisionNotLive;
    } else {
      revisionToShow = course.courseRevisions.find((revision) => revision.status === "live");
    }
    course.setDataValue("activeCourseRevision", revisionToShow);
    return course;
  },

  getCourseRevisionToUpdate: (course) => {
    let courseRevisionToUpdate = null;
    let revisionNotLive = course.courseRevisions.find((revision) => ["draft", "disapproved"].includes(revision.status));

    if (revisionNotLive) {
      courseRevisionToUpdate = revisionNotLive;
    }

    return courseRevisionToUpdate;
  },

  createSchoolCourseCategories: async (schoolId) => {
    const {
      defaultCategory: DefaultCategory,
      category: Category,
      media: Media
    } = require("../config/database/models");

    let attributes = { exclude: ["uuid", "createdAt", "updatedAt", "slug", "parentCategoryId", "deletedAt"] };
    try {
      // GET parent categories
      let defaultCategories = await DefaultCategory.findAll({
        where: { parentCategoryId: null },
        attributes,
        include: [
          { model: DefaultCategory, as: "subcategories", attributes },
          { model: Media, as: "icon", attributes }
        ]
      });

      if (!defaultCategories) {
        utils.writeToFile(`[Error: creating categories for school ${schoolId}] => Could not find categories`);
        return null;
      }
      for (let category of defaultCategories) {
        let createdCategory = await Category.create({
          name: category.name,
          schoolId
        });

        console.log(`Created category ${createdCategory.name} for school ${schoolId}`);

        if (category.iconId && category.icon) {
          let createdIcon = await Icon.create({ url: category.icon.url });
          await createdCategory.setIcon(createdIcon.uuid);
        }
        if (category.subcategories && category.subcategories.length) {
          for (let subcategory of category.subcategories) {
            let createdSubcategory = await Category.create({
              name: subcategory.name,
              parentCategoryId: createdCategory.uuid,
              schoolId
            });
            if (subcategory.iconId && subcategory.icon) {
              let createdSubIcon = await Icon.create({ url: subcategory.icon.url });
              await createdSubcategory.setIcon(createdSubIcon.uuid);
            }
          }
        }
      }
      return true;
    } catch (e) {
      utils.writeToFile(` [Error: creating categories for school ${schoolId}] => ${e.toString()}`);
      return null;
    }
  },


  spaces: {
    upload: async () => {
      // let file = fs.readFileSync(path.join('__dirname',"../media/1603201576567-Chimeremma's-SIWES-letter.jpeg"));
      // let params = {
      //   Bucket: "dumo-cloud",
      //   Key: "media/my-image2",
      //   "ContentType": "image/jpeg",
      //   Body: file,
      //   ACL: "public-read"
      // };

      // s3.putObject(params, function(err, data) {
      //   if (err){
      //     console.log('Upload response error => ',err, err.stack);
      //   } else {
      //     console.log('Upload response data => ', data);
      //   }
      // });
    },

    createUploadUrl: (key, contentType) => {
      const expireSeconds = 60 * 5;
      const url = s3.getSignedUrl("putObject", {
        Bucket: process.env.SPACES_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
        Expires: expireSeconds,
        ACL: "public-read"
      });
      return url;
    },

    deleteObject: (key) => {
      let params = {
        Bucket: process.env.SPACES_BUCKET_NAME,
        Key: key
      };
      s3.deleteObject(params, function (err, data) {
        if (err) {
          utils.writeToFile(`[Lecture content deletion error]: ${err.toString()}`);
        } else {
          console.log("[Lecture content deleted] => ", data);
        }
      });
    },
    createObjectReference: (folder) => {
      return `${folder}/${uuidv4()}`;
    }
  },
  checkPaymentProviderCredentials: (schoolPaymentProvider) => {
    if (schoolPaymentProvider.paymentProvider.name === "paystack") {
      let { secretKey, publicKey } = JSON.parse(schoolPaymentProvider.credentials);
      if (secretKey && publicKey) {
        return true;
      }
      return false;
    }
    if (schoolPaymentProvider.paymentProvider.name === "monnify") {
      let { monnifySubAccountCode } = schoolPaymentProvider.credentials;
      if (monnifySubAccountCode) {
        return true;
      }
      return false;
    }
    return false;
  },
  createMonnifySubAccount: async (credentials) => {
    try {
      let data = [];
      let { currencyCode, bankCode, accountNumber, email } = credentials;
      let reqBody = {
        currencyCode,
        bankCode,
        accountNumber,
        email,
        defaultSplitPercentage: 98
      };
      data.push(reqBody);

      const response = await axios({
        method: "post",
        url: `${monnifyApiUrl}/api/v1/sub-accounts`,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${encodedMonnifyCredentials}`
        },
        data: data
      });

      console.log("New sub-account created...");
      return response.data.responseBody[0].subAccountCode;
    } catch (e) {
      utils.writeToFile(e);
      return null;
    }
  },
  getMonnifyAccessToken: async () => {
    try {
      const response = await axios({
        method: "post",
        url: `${monnifyApiUrl}/api/v1/auth/login`,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${encodedMonnifyCredentials}`
        }
      });

      if (response && response.data.requestSuccessful == true) {
        console.log("Monnify Access Token Retrieved...");
        return response.data.responseBody.accessToken;
      }
    } catch (error) {
      utils.writeToFile(e);
      return null;
    }
  }
};

module.exports = utils;
