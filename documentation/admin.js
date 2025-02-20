let string = "string";
let object = "object";
let integer = "integer";
let array = "array";
let boolean = "boolean";
let number = "number";

module.exports = {
  "/admin/approve":{
    post : {
      tags : ["Admin"],
      description : "Approve a course/section/lecture",
      requestBody : {
        required : true,
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
                    courseId : {
                      type : string
                    }
                  }
                },
                {
                  type : object,
                  properties : {
                    sectionId : {
                      type : string
                    }
                  }
                },
                {
                  type : object,
                  properties : {
                    lectureId : {
                      type : string
                    }
                  }
                },
              ]
            }
          }
        }
      },
      responses : {
        "200":{
          description: "Course/Section/Lecture approved",
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
  "/admin/disapprove":{
    post : {
      tags : ["Admin"],
      description : "Disapprove a course/section/lecture",
      requestBody : {
        required : true,
        content : {
          "application/json":{
            schema : {
              example : {
                courseId : string,
                adminFeedback : "string"
              },
              oneOf : [
                {
                  type : object,
                  properties : {
                    courseId : {
                      type : string
                    },
                    adminFeedback : {
                      type : string
                    }
                  }
                },
                {
                  type : object,
                  properties : {
                    sectionId : {
                      type : string
                    },
                    adminFeedback : {
                      type : string
                    }
                  }
                },
                {
                  type : object,
                  properties : {
                    lectureId : {
                      type : string
                    },
                    adminFeedback : {
                      type : string
                    }
                  }
                },
              ]
            }
          }
        }
      },
      responses : {
        "200":{
          description: "Course/Section/Lecture disapproved",
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
  "/admin/review?page={page}&limit={limit}":{
    get : {
      tags : ["Admin"],
      description : "Get courses submitted for review",
      parameters : [
        {
          $ref : "#/components/parameters/page"
        },
        {
          $ref : "#/components/parameters/limit"
        }
      ],
      responses : {
        "200":{
          description: "Courses retrieved",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponsePaginatedCourses"
              }
            }
          }
        }
      }
    }
  },
  "/admin/review/{courseId}":{
    get : {
      tags : ["Admin"],
      parameters : [
        {
          $ref : "#/components/parameters/courseId"
        }
      ],
      description : "Get a single course submitted for review",
      responses : {
        "200":{
          description: "Course retrieved",
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
  "/admin/feature/{courseId}":{
    post : {
      tags : ["Admin"],
      description : "Set a course as the featured course for a category",
      parameters : [
        {
          $ref : "#/components/parameters/courseId"
        }
      ],
      requestBody : {
        required : true,
        content : {
          "application/json":{
            schema : {
              type : object,
              properties : {
                categoryId : {
                  type : string,
                  description : "Category to feature this course in"
                }
              },
            }
          }
        }
      },
      responses : {
        "200":{
          description: "Course featured",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponse"
              }
            }
          }
        },
        "404":{
          description: "Category/course not found",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseResourceNotFound"
              }
            }
          }
        }
      }
    }
  },
  "/admin/settings/payment/{providerId}": {
    patch : {
      tags : ["Admin"],
      description : "Set the API keys (public and secret) for a payment provider",
      parameters : [
        {
          $ref : "#/components/parameters/providerId"
        }
      ],
      requestBody : {
        required : true,
        content : {
          "application/json":{
            schema : {
              type : object,
              properties : {
                publicKey : {
                  type : string,
                  description : "API public key"
                },
                secretKey : {
                  type : string,
                  description : "API secret key"
                }
              },
            }
          }
        }
      },
      responses : {
        "200":{
          description: "Payment provider keys set successfully",
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
  "/admin/new": {
    patch : {
      tags : ["SuperAdmin"],
      description : "Add new admin",
      requestBody : {
        required : true,
        content : {
          "application/json":{
            schema : {
              type : object,
              properties : {
                email : {
                  type : string,
                  description : "User's email - (user to be made admin)"
                }
              },
            }
          }
        }
      },
      responses : {
        "200":{
          description: "User has been made admin",
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
  "/admin/remove": {
    patch : {
      tags : ["SuperAdmin"],
      description : "Remove an existing admin",
      requestBody : {
        required : true,
        content : {
          "application/json":{
            schema : {
              type : object,
              properties : {
                email : {
                  type : string,
                  description : "User's email - (admin to be stripped of admin privileges)"
                }
              },
            }
          }
        }
      },
      responses : {
        "200":{
          description: "User has been successfully removed as admin",
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
  "/admin/users":{
    get : {
      tags : ["Admin"],
      description : "Get acadabay users - with their courses, enrolments and amounts they've made as instructors",
      responses : {
        "200":{
          description: "Users retrieved",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseAdminListUsers"
              }
            }
          }
        }
      }
    }
  },
  "/admin/remove": {
    patch : {
      tags : ["SuperAdmin"],
      description : "Remove an existing admin",
      requestBody : {
        required : true,
        content : {
          "application/json":{
            schema : {
              type : object,
              properties : {
                email : {
                  type : string,
                  description : "User's email - (admin to be stripped of admin privileges)"
                }
              },
            }
          }
        }
      },
      responses : {
        "200":{
          description: "User has been successfully removed as admin",
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
  "/admin/settings": {
    patch : {
      tags : ["Admin"],
      description : "Update general platform settings",
      requestBody : {
        required : true,
        content : {
          "application/json":{
            schema : {
              type : object,
              properties : {
                coursePricePercentage : {
                  type : number,
                  description : "Course price percentage that goes to acadabay per course purchase"
                }
              },
            }
          }
        }
      },
      responses : {
        "200":{
          description: "Settings updated",
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
  "/admin/analytics": {
    get : {
      tags : ["Admin"],
      description : "Platform analytics",
      requestBody : {
        required : true,
        content : {
          "application/json":{
            schema : {
              type : object,
              properties : {

              },
            }
          }
        }
      },
      responses : {
        "200":{
          description: "Analytics retrieved",
          content : {
            "application/json": {
              schema : {
                type : "object",
                properties : {
                  success : {
                    type : boolean
                  },
                  message : {
                    type : string
                  },
                  data : {
                    type : object,
                    properties : {
                      "totalEnrolments": {
                        type : number
                      },
                      "totalEnrolmentsToday": {
                        type : number
                      },
                      "totalEarnings": {
                        type : number
                      },
                      "totalEarningsToday": {
                        type : number
                      },
                      "totalInstructorEarnings": {
                        type : number
                      },
                      "totalInstructorEarningsToday": {
                        type : number
                      },
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "/admin/revert-to-draft": {
    post: {
      tags : ["Admin"],
      description : "Revert a course/section/lecture to draft",
      requestBody : {
        required : true,
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
                    courseId : {
                      type : string
                    }
                  }
                },
                {
                  type : object,
                  properties : {
                    sectionId : {
                      type : string
                    }
                  }
                },
                {
                  type : object,
                  properties : {
                    lectureId : {
                      type : string
                    }
                  }
                },
              ]
            }
          }
        }
      },
      responses : {
        "200":{
          description: "Course/Section/Lecture reverted to draft",
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
  "/admin/transactions": {
    get : {
      tags : ["Admin"],
      description : "Get general platform transactions - Payments made for courses",
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
};