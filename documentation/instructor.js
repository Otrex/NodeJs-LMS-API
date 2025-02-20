let string = "string";
let object = "object";
let integer = "integer";
let array = "array";
let boolean = "boolean";
let number = "number";


module.exports = {
  "/instructors/courses?page={page}&limit={limit}": {
    get : {
      tags : ["Instructors"],
      description : "Get instructor's courses",
      responses : {
        "200": {
          description : "Courses retrieved successfully",
          parameters : [
            {
              $ref : "#/components/parameters/page"
            },
            {
              $ref : "#/components/parameters/limit"
            }
          ],
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseCourses"
              }
            }
          }
        }
      }
    }
  },
  "/instructors/courses/{courseId}": {
    get : {
      tags : ["Instructors"],
      description : "Get instructor's courses",
      parameters : [
        {
          $ref : "#/components/parameters/courseId"
        }
      ],
      responses : {
        "200": {
          description : "Course retrieved successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseCourse"
              }
            }
          }
        }
      }
    }
  },
  "/instructors/submit":{
    post : {
      tags : ["Instructors"],
      description : "Submit a course for review",
      requestBody : {
        content : {
          "application/json":{
            schema : {
              example : {
                courseId : string
              },
              oneOf : [
                {
                  type : object,
                  properties : {
                    "courseId":{
                      type : string
                    }
                  }
                },
                {
                  type : object,
                  properties : {
                    "sectionId":{
                      type : string
                    }
                  },
                },
                {
                  type : object,
                  properties : {
                    "lectureId":{
                      type : string
                    }
                  }
                }
              ]
            }
          }
        }
      },
      responses : {
        "200":{
          description: "Course was submitted successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponse"
              }
            }
          }
        }
      }
    }
  },
  "/instructors/transactions": {
    get : {
      tags : ["Instructors"],
      description : "Get instructor's transactions - Payments made for this instructor's courses",
      responses : {
        "200": {
          description : "transactions retrieved successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponsePaginatedTransactions"
              }
            }
          }
        }
      }
    }
  },
  "/instructors/analytics": {
    get : {
      tags : ["Instructors"],
      description : "Get instructor's general analytics",
      responses : {
        "200": {
          description : "analytics retrieved successfully",
          content : {
            "application/json": {
              schema : {
                type : object,
                properties : {
                  "studentsEnrolled": {
                    type : number
                  },
                  "amountToday": {
                    type : number
                  },
                  "amountTotal": {
                    type : number
                  }
                }
              }
            }
          }
        }
      }
    }
  },

};

