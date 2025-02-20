let string = "string";
let object = "object";
let integer = "integer";
let array = "array";
let boolean = "boolean";

module.exports = {
  "/courses":{
    post : {
      tags : ["Courses"],
      description : "Create a new course",
      requestBody : {
      },
      responses : {
        "201":{
          description: "Course was created successfully",
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
  "public/courses/{slug}":{
    get : {
      security : [],
      tags : ["Courses"],
      description : "Get a single courses' full details",
      parameters : [
        {
          $ref : "#/components/parameters/courseId"
        }
      ],
      responses : {
        "200":{
          description: "Course was retrieved successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseCourse"
              }
            }
          }
        }
      }
    },
    patch : {
      tags : ["Courses", "Admin"],
      description : "Update a course",
      requestBody : {
        content : {
          "application/json": {
            schema : {
              $ref : "#/components/schemas/Course"
            }
          }
        }
      },
      responses : {
        "200":{
          description: "Courses updated successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseCourse"
              }
            }
          }
        }
      }
    },
    delete : {
      tags : ["Courses","Admin"],
      description : "Delete a course",
      responses : {
        "200": {
          content : {
            "application/json" : {
              schema : {
                $ref : "#/components/responses/GenericResponse"
              }
            }
          }
        },
        "404": {
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
  "public/courses/categories/{categoryId}?page={page}?limit={limit}":{
    get : {
      security : [],
      tags : ["Courses"],
      description : "Get courses in a particular category [paginated]",
      parameters : [
        {
          $ref : "#/components/parameters/page"
        },
        {
          $ref : "#/components/parameters/categoryId"
        },
        {
          $ref : "#/components/parameters/limit"
        }
      ],
      responses : {
        "200":{
          description: "Courses retrieved successfully",
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
  // "/courses/{courseId}/order":{
  //   post : {
  //     tags : ["Courses"],
  //     description : "Order a course",
  //     parameters : [
  //       {
  //         $ref : "#/components/parameters/courseId"
  //       }
  //     ],
  //     responses : {
  //       "201":{
  //         description: "Course ordered successfully",
  //         content : {
  //           "application/json": {
  //             schema : {
  //               $ref : "#/components/responses/GenericResponse"
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // },
  "/courses/{courseId}/submit":{
    post : {
      tags : ["Courses","Instructors"],
      description : "Submit a course for review",
      parameters : [
        {
          $ref : "#/components/parameters/courseId"
        }
      ],
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
  "/courses/enrolled":{
    get : {
      tags : ["Courses"],
      description : "Get users' enrolled courses - courses user has paid for",
      responses : {
        "200":{
          description: "Courses retrieved successfully",
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
  "/courses/enrolled/{courseId}":{
    get : {
      tags : ["Courses"],
      parameters : [
        {
          $ref : "#/components/parameters/courseId"
        }
      ],
      description : "Get users' enrolled course - Take a course, basically",
      responses : {
        "200":{
          description: "Course retrieved successfully",
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
  "/courses/{courseId}/rating":{
    post : {
      tags : ["Courses"],
      description : "Rate and write a review for an enrolled course",
      requestBody : {
        required : true,
        content : {
          "application/json": {
            schema : {
              type : object,
              properties : {
                rating : {
                  type : integer,
                  enum : [1,2,3,4,5]
                },
                review : {
                  type : string
                }
              }
            }
          }
        }
      },
      responses : {
        "200":{
          description: "Rating submitted successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponse"
              }
            }
          }
        }
      }
    },
    delete : {
      tags : ["Courses"],
      description : "Delete a rating/review",
      responses : {
        "200":{
          description: "Rating deleted successfully",
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
  "/courses/featured/{categoryId}":{
    get : {
      tags : ["Courses"],
      security : [],
      description : "Get the currently featured course for category {categoryId}",
      parameters : [
        {
          $ref : "#/components/parameters/categoryId"
        }
      ],
      responses : {
        "200":{
          description: "Course retrieved successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseCourse"
              }
            }
          }
        },
        "404":{
          description: "No featured course found",
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
  "/courses/featured/random":{
    get : {
      tags : ["Courses"],
      security : [],
      description : "Get a random featured course",
      responses : {
        "200":{
          description: "Course retrieved successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseCourse"
              }
            }
          }
        },
        "404":{
          description: "No featured course found",
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
  "public/courses/trending":{
    get : {
      tags : ["Courses"],
      security : [],
      description : "Get trending courses - most viewed courses [10]",
      responses : {
        "200":{
          description: "Courses retrieved successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseCourses"
              }
            }
          }
        },
      }
    }
  },
  "public/courses/search?query={query}&page={page}?limit={limit}":{
    get : {
      tags : ["Courses"],
      security : [],
      parameters : [
        {
          $ref : "#/components/parameters/query"
        },
        {
          $ref : "#/components/parameters/page"
        },
        {
          $ref : "#/components/parameters/limit"
        }
      ],
      description : "Search courses with query string {query}",
      responses : {
        "200":{
          description: "Courses retrieved successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponsePaginatedCourses"
              }
            }
          }
        },
        "404":{
          description: "course not found",
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
  "public/courses/live?page={page}&limit={limit}":{
    get : {
      tags : ["Courses"],
      security : [],
      description : "Get live courses [paginated]",
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
          description: "Courses retrieved successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponsePaginatedCourses"
              }
            }
          }
        },
      }
    }
  }
};