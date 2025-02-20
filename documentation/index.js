const userRoutes = require("./user");
const courseRoutes = require("./course");
const categoryRoutes = require("./category");
const lectureRoutes = require("./lecture");
const mediaRoutes = require("./media");
const sectionRoutes = require("./section");
const adminRoutes = require("./admin");
const instructorRoutes = require("./instructor");
const transactionRoutes = require("./transaction");
const supportRoutes = require("./support");

const lmsAdmin = require("./lmsAdmin");

let string = "string";
let object = "object";
let integer = "integer";
let array = "array";
let boolean = "boolean";
let number = "number";

let genericResponseFields = {
  success : {
    type : boolean
  },
  message : {
    type : string
  },
};
let categoryFields = {
  name : {
    type : string
  },
  uuid : {
    type : string
  }
};



let userProfileFields = {
  firstName : {
    type : string
  },
  lastName : {
    type : string
  },
  tagline : {
    type : string
  },
  about : {
    type : string
  }
};

const schoolFields = {
  name: {
    type: string,
    example: "Awesome school"
  },
  description: {
    type: string,
    example: "Awesome school for awesome people"
  },
  domainName: {
    type: string,
    example: "www.awesome.school"
  }
}


module.exports = {
  openapi: "3.0.1",
  info: {
    version: "1.0.0",
    title: "DUMO LMS",
    description: "DUMO LMS API Endpoints Documentation",
  },
  servers : [
    {
      url : "https://api.dumo.cloud/lms",
      description : "Production server"
    },
    {
      url : "https://api.dumo.cloud/_dev/lms",
      description : "Staging server"
    }
  ],
  tags : [
    { name : "Users" },
    { name : "Courses" }
  ],
  components : {
    securitySchemes : {
      bearerAuth : {
        type : "http",
        scheme : "bearer",
        bearerFormat : "JWT",
        in : "header",
        name : "Authorization"
      }
    },
    schemas : {
      User : {
        type : object,
        properties: {
          email : {
            type : string,
            format : "email",
          },
          password : {
            type : string
          },
          ...userProfileFields,
        },
        required : ["email","password","lastName","firstName"]
      },
      UserProfile : {
        type : object,
        properties : {
          ...userProfileFields
        }
      },
      Course : {
        type : object,
        properties : {
          uuid : {
            type : string
          },
          title : {
            type : string
          },
          subtitle : {
            type : string
          },
          about : {
            type: string
          },
          learningOutcomes : {
            $ref : "#/components/compositions/StringArray"
          },
          requirements : {
            $ref : "#/components/compositions/StringArray"
          },
          skills : {
            $ref : "#/components/compositions/StringArray"
          },
          categoryId : {
            type : string,
            description : "Should be the ID of the subcategory if both category and sub are chosen"
          },
          welcomeMessage : {
            type : string
          },
          congratulatoryMessage : {
            type : string
          },
          amount : {
            type : number
          },
          currency : {
            type : string,
            enum : ["NGN","USD"]
          }
        }
      },
      CourseSummary : {
        type : object,
        properties : {
          title : {
            type : string
          },
          about : {
            type : string
          },
          learningOutcomes : {
            $ref : "#/components/compositions/StringArray"
          }
        }
      },
      Category : {
        type : object,
        properties : {
          ...categoryFields
        }
      },
      Lecture : {
        type : object,
        properties : {
          uuid : {
            type : string
          },
          index : {
            type : integer
          },
          title : {
            type : string
          },
          content : {
            $ref : "#/components/schemas/Media"
          }
        }
      },
      Section : {
        type : object,
        properties : {
          title : {
            type : string
          },
          index : {
            type : integer
          },
          learningObjective : {
            type : string
          },
          courseId : {
            type : string,
            description : "UUID of the course this section belongs to"
          }
        }
      },
      Media : {
        type : object,
        properties : {
          uuid : {
            type : string
          },
          url : {
            type : string
          }
        }
      },
      ParentCategory : {
        description : "A parent category with its subcategories listed",
        type : object,
        properties : {
          ...categoryFields,
          subcategories : {
            type : array,
            items : {
              type : object,
              properties : {
                ...categoryFields
              }
            }
          }
        }
      },
      Transaction : {
        type : object,
        properties : {
          uuid : {
            type : string
          },
          status : {
            type : string,
            enum :["success","failed"]
          },
          courseId : {
            type : string
          },
          userId : {
            type : string
          },
          paymentGateway : {
            type : string,
            example : "Paystack"
          },
          amount : {
            type : number
          }
        }
      },
      PaymentProvider : {
        type : object,
        properties : {
          uuid : {
            type : string
          },
          name : {
            type : string
          },
          publicKey : {
            type : string
          }
        }
      },
      AdminListUser : {
        type : object,
        properties : {
          amountTotal : {
            type : number,
            description : "Total amount user has made from their courses"
          },
          enrolments : {
            type : array,
            description : "Courses that user has enrolled in",
            items : {
              $ref : "#/components/compositions/Courses"
            }
          },
          courses: {
            type: array,
            description: "Courses user has created",
            items: {
              $ref: "#/components/compositions/Courses"
            }
          }
        }
      },
      School: {
        type: object,
        properties: {
          ...schoolFields
        },
        required: ["name","description"]
      }
    },
    compositions : {
      StringArray : {
        type : array,
        items : {
          type : string
        }
      },
      Courses : {
        type : array,
        items : {
          $ref : "#/components/schemas/Course"
        }
      },
      ParentCategories : {
        type : array,
        items : {
          $ref : "#/components/schemas/ParentCategory"
        }
      },
      Categories : {
        type : array,
        items : {
          $ref : "#/components/schemas/Category"
        }
      },
      Transactions : {
        type : array,
        items : {
          $ref : "#/components/schemas/Transaction"
        }
      },
      PaymentProviders : {
        type : array,
        items : {
          $ref : "#/components/schemas/PaymentProvider"
        }
      },
      AdminListUsers : {
        type : array,
        items : {
          $ref : "#/components/schemas/AdminListUser"
        }
      },
      Schools: {
        type: array,
        items: {
          $ref: '#/components/schemas/School'
        }
      }
    },
    responses : {
      GenericResponse : {
        type : object,
        properties : {
          ...genericResponseFields
        }
      },
      GenericResponseInvalid : {
        type : object,
        properties : {
          ...genericResponseFields
        },
        example : {
          success : false,
          message : "field x not provided / invalid value provided for field y / ...etc"
        }
      },
      GenericResponseUser : {
        type : object,
        properties : {
          ...genericResponseFields,
          data : {
            $ref : "#/components/schemas/User"
          }
        }
      },
      GenericResponseAdminListUsers : {
        type : object,
        properties : {
          ...genericResponseFields,
          data : {
            $ref : "#/components/compositions/AdminListUsers"
          }
        }
      },
      GenericResponseUserToken : {
        type : object,
        properties : {
          ...genericResponseFields,
          data : {
            $ref : "#/components/schemas/User"
          },
          token : {
            type : string
          }
        }
      },
      GenericResponseCourseSummary : {
        type : object,
        properties : {
          ...genericResponseFields,
          data : {
            $ref : "#/components/schemas/CourseSummary"
          }
        }
      },
      GenericResponseCourse : {
        type : object,
        properties : {
          ...genericResponseFields,
          data : {
            $ref : "#/components/schemas/Course"
          }
        }
      },
      GenericResponseCourses : {
        type : object,
        properties : {
          ...genericResponseFields,
          data : {
            $ref : "#/components/compositions/Courses"
          }
        }
      },
      GenericResponsePaginatedCourses : {
        type : object,
        properties : {
          ...genericResponseFields,
          pages : {
            type : integer,
            description : "Total number of page results available"
          },
          count : {
            type : integer,
            description : "Total number of resource (course) results found"
          },
          data : {
            $ref : "#/components/compositions/Courses"
          }
        }
      },
      GenericResponsePaginatedTransactions : {
        type : object,
        properties : {
          ...genericResponseFields,
          pages : {
            type : integer,
            description : "Total number of page results available"
          },
          count : {
            type : integer,
            description : "Total number of resource (transactions) results found"
          },
          data : {
            $ref : "#/components/compositions/Transactions"
          }
        }
      },
      GenericResponseCategory : {
        type : object,
        properties : {
          ...genericResponseFields,
          data : {
            $ref : "#/components/schemas/Category"
          }
        }
      },
      GenericResponseCategories : {
        type : object,
        properties : {
          ...genericResponseFields,
          data : {
            $ref : "#/components/compositions/Categories"
          }
        }
      },
      GenericResponseParentCategories : {
        type : object,
        properties : {
          ...genericResponseFields,
          data : {
            $ref : "#/components/compositions/ParentCategories"
          }
        }
      },
      GenericResponseLecture : {
        type : object,
        properties : {
          ...genericResponseFields,
          data : {
            $ref : "#/components/schemas/Lecture"
          }
        }
      },
      GenericResponseSection : {
        type : object,
        properties : {
          ...genericResponseFields,
          data : {
            $ref : "#/components/schemas/Section"
          }
        }
      },
      GenericResponseMedia : {
        type : object,
        properties : {
          ...genericResponseFields,
          data : {
            $ref : "#/components/schemas/Media"
          }
        }
      },
      GenericResponseTransaction : {
        type : object,
        properties : {
          ...genericResponseFields,
          data : {
            $ref : "#/components/schemas/Transaction"
          }
        }
      },
      GenericResponsePaymentProviders : {
        type : object,
        properties : {
          ...genericResponseFields,
          data : {
            $ref : "#/components/compositions/PaymentProviders"
          }
        }
      },
      GenericResponseUserUnauthorized : {
        description : "User unauthorized",
        type : object,
        properties : {
          success : {
            type : boolean,
            value : false
          },
          message : {
            type : string,
          }
        }
      },
      GenericResponseServerError : {
        type : object,
        properties : {
          success : {
            type : boolean
          },
          message : {
            type : string,
            example : "An error occurred"
          }
        }
      },
      GenericResponseUnauthorizedError : {
        description : "Request unauthorized because bearer token is missing or invalid",
        properties : {
          success : {
            type : boolean,
            value : false
          },
          message : {
            type : string,
          }
        },
        example : {
          success : false,
          message : "No bearer token sent"
        }
      },
      GenericResponseResourceNotFound : {
        description : "Resource not found",
        properties : {
          success : {
            type : boolean,
            value : false
          },
          message : {
            type : string,
          }
        },
        example : {
          success : false,
          message : "Resource [Lecture|Course|Section] not found"
        }
      },
      GenericResponseSchool:{
        type: object,
        properties: {
          ...genericResponseFields,
          data: {
            $ref: '#/components/schemas/School'
          }
        }
      },
      GenericResponseSchools:{
        type: object,
        properties: {
          ...genericResponseFields,
          data: {
            $ref: '#/components/compositions/Schools'
          }
        }
      }
    },
    customTypes : {
      password : {
        type : string,
        format : "password"
      }
    },
    parameters : {
      page : {
        in : "query",
        name : "page",
        description : "pagination page number",
        required : true,
        schema : {
          type : integer
        }
      },
      limit : {
        in : "query",
        name : "limit",
        description : "No of resources(courses, user etc) to return per page",
        required : false,
        schema : {
          type : integer
        }
      },
      authCode : {
        in : "query",
        name : "authCode",
        description : "Third party signin auth code",
        required : false,
        schema : {
          type : string
        }
      },
      categoryId : {
        in : "path",
        name : "categoryId",
        type : string,
        format : "uuid",
      },
      courseId : {
        in : "path",
        name : "courseId",
        type : string,
        format : "uuid"
      },
      lectureId : {
        in : "path",
        name : "lectureId",
        type : string,
        format : "uuid"
      },
      sectionId : {
        in : "path",
        name : "sectionId",
        type : string,
        format : "uuid"
      },
      query : {
        in : "query",
        name : "query",
        description : "search query string",
        required : true,
        schema : {
          type : string
        }
      },
      providerId : {
        in : "path",
        name : "providerId",
        type : string,
        format : "uuid",
        description : "UUID of a payment provider",
      },
      affiliateReferralCode: {
        in: "query",
        name: "affiliateReferralCode",
        type: string,
        description : "Affiliate referral code",
        schema : {
          type : string
        }
      }
    }
  },
  security : {
    bearerAuth : []
  },
  paths: {
    ...userRoutes,
    ...courseRoutes,
    ...categoryRoutes,
    ...lectureRoutes,
    ...mediaRoutes,
    ...sectionRoutes,
    ...adminRoutes,
    ...instructorRoutes,
    ...transactionRoutes,
    ...supportRoutes,
    ...lmsAdmin
  }

};