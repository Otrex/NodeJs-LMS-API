let string = "string";
let object = "object";
let integer = "integer";
let array = "array";
let boolean = "boolean";

module.exports = {
  "/admin/schools":{
    post : {
      tags : ["LMS Admin"],
      description : "Create a school",
      requestBody : {
        required : true,
        content : {
          "application/json": {
            schema : {
              type : object,
              properties : {
                name: {
                  type : string,
                  description : "Name of school"
                },
                description: {
                  type : string,
                  description : "School description"
                },
                domainName: {
                  type : string,
                  description : "School domain name"
                }
              }
            }
          }
        },
      },
      responses : {
        "201":{
          description: "School was created successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseSchool"
              }
            }
          }
        }
      }
    },
    get: {
      tags : ["LMS Admin"],
      description : "Get schools where the logged in DUMO user is an admin",
      requestBody : {
      },
      responses : {
        "201":{
          description: "Schools retrieved successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseSchools"
              }
            }
          }
        }
      }
    }
  },
  "/admin/schools/{schoolId}": {
    get: {
      tags : ["LMS Admin"],
      description : "Get single school details",
      requestBody : {
      },
      responses : {
        "200":{
          description: "School retrieved successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseSchool"
              }
            }
          }
        }
      }
    }
  },
  "/admin/schools/{schoolId}/courses": {
    post: {
      tags : ["LMS Admin"],
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
  "/admin/schools/{schoolId}/courses/{courseId}": {
    patch: {
      tags: ["LMS Admin"],
      description: "Update a course",
      requestBody: {
        content: {
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
    }
  },
  "/admin/schools/{schoolId}/courses/{courseId}/new-revision": {
    post: {
      tags: ["LMS Admin"],
      description: "Create a new revision of a course",
      requestBody: {
      },
      responses : {
        "200":{
          description: "Course revision created successfully",
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
  "/admin/schools/{schoolId}/courses/review": {
    get : {
      tags : ["LMS Admin"],
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
  "/admin/schools/{schoolId}/courses/live": {
    get : {
      tags : ["LMS Admin"],
      description : "Get live courses",
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
  "/admin/schools/{schoolId}/courses/featured": {
    get : {
      tags : ["LMS Admin"],
      description : "Get featured courses",
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
  "/admin/schools/{schoolId}/courses/all": {
    get : {
      tags : ["LMS Admin"],
      description : "Get all courses",
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
  "/admin/schools/{schoolId}/courses/{courseId}/publish": {
    post : {
      tags : ["LMS Admin"],
      description : "Publish a course - make a course go live",
      requestBody : {
      },
      responses : {
        "200": {
          description : "Course published successfully",
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
  "/admin/schools/{schoolId}/courses/{courseId}": {
    get : {
      tags : ["LMS Admin"],
      description : "Get a single courses' data",
      requestBody : {
      },
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
  "/admin/schools/{schoolId}/sections": {
    post : {
      tags : ["LMS Admin"],
      description : "Create a section",
      requestBody : {
        required : true,
        content : {
          "application/json": {
            schema : {
              type : object,
              properties : {
                title : {
                  type : string
                },
                learningObjective : {
                  type : string
                },
                courseId : {
                  type : string,
                  description : "UUID of the course this section belongs to"
                }
              }
            }
          }
        }
      },
      responses : {
        "200": {
          description : "section created successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseSection"
              }
            }
          }
        }
      }
    }
  },
  "/admin/schools/{schoolId}/sections/{sectionId}": {
    patch : {
      tags : ["LMS Admin"],
      description : "Update a section",
      parameters : [
        {
          $ref : "#/components/parameters/sectionId"
        }
      ],
      requestBody : {
        required : true,
        content : {
          "application/json": {
            schema : {
              type : object,
              properties : {
                title : {
                  type : string
                },
                learningObjective : {
                  type : string
                }
              }
            }
          }
        }
      },
      responses : {
        "200": {
          description : "Section updated successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseLecture"
              }
            }
          }
        },
        "401": {
          description : "Request not granted - section belongs to a different user",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseUserUnauthorized"
              }
            }
          }
        },
        "404": {
          description : "Section not found",
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
  delete : {
    tags : ["LMS Admin"],
    description : "Delete a section",
    responses : {
      "200": {
        content : {
          "application/json" : {
            schema : {
              $ref : "#/components/responses/GenericResponse"
            }
          }
        }
      }
    }
  },
  "/admin/schools/{schoolId}/sections/:sectionId/lectures": {
    post : {
      tags : ["LMS Admin"],
      description : "Create a lecture",
      requestBody : {
        required : true,
        content : {
          "multipart/form-data": {
            schema : {
              type : object,
              properties : {
                title : {
                  type : string
                },
                sectionId : {
                  type : string,
                  description : "UUID of the section this lecture belongs to"
                },
                text : {
                  type : string
                },
                media : {
                  type : string,
                  format : "binary",
                  description : "Lecture video file"
                }
              }
            }
          }
        }
      },
      responses : {
        "200": {
          description : "Lecture created successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseLecture"
              }
            }
          }
        }
      }
    }
  },
  "/admin/schools/{schoolId}/sections/:sectionId/lectures/{lectureId}": {
    patch : {
      tags : ["LMS Admin"],
      description : "Update a lecture",
      parameters : [
        {
          $ref : "#/components/parameters/lectureId"
        }
      ],
      requestBody : {
        required : true,
        content : {
          "multipart/form-data": {
            schema : {
              type : object,
              properties : {
                title : {
                  type : string
                },
                text : {
                  type : string
                },
                media : {
                  type : string,
                  format : "binary",
                  description : "Lecture video file"
                }
              }
            }
          }
        }
      },
      responses : {
        "200": {
          description : "Lecture updated successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseLecture"
              }
            }
          }
        },
        "401": {
          description : "Request not granted - lecture belongs to a different user",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseUserUnauthorized"
              }
            }
          }
        },
        "404": {
          description : "Lecture not found",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseResourceNotFound"
              }
            }
          }
        }
      }
    },
    delete : {
      tags : ["LMS Admin"],
      description : "Delete a lecture",
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
  "/admin/schools/{schoolId}/lectures/{lectureId}/content":{
    post : {
      tags : ["LMS Admin"],
      description : "Create a lecture content",
      requestBody : {
        required : true,
        content : {
          "multipart/form-data": {
            schema : {
              type : object,
              properties : {
                lectureContentType : {
                  type : string,
                  enum: ["video","audio","note","pdf"]
                },
                index: {
                  type: integer
                },
                content: {
                  type: string,
                  description: "WYSIWYG content of a lecture note - only needed if the lectureContentType is 'note'"
                },
                media : {
                  type : string,
                  format : "binary",
                  description : "Lecture video/audio/pdf file - must be sent if lectureContentType is either video, audio or pdf"
                }
              }
            }
          }
        }
      },
      responses : {
        "200": {
          description : "Lecture created successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseLecture"
              }
            }
          }
        }
      }
    }
  },
  "/admin/schools/{schoolId}/lectures/{lectureId}/content/{contentId}": {
    patch : {
      tags : ["LMS Admin"],
      description : "Update a lecture content's content",
      parameters : [
        {
          $ref : "#/components/parameters/lectureId"
        }
      ],
      requestBody : {
        required : true,
        content : {
          "multipart/form-data": {
            schema : {
              type : object,
              properties : {
                content: {
                  type: string,
                  description: "WYSIWYG content of a lecture note - must be sent if this lecture content is a 'note'"
                },
                media : {
                  type : string,
                  format : "binary",
                  description : "Lecture video/audio/pdf file - must be sent if this lecture content's type is either video, audio or pdf"
                }
              }
            }
          }
        }
      },
      responses : {
        "200": {
          description : "Lecture content updated successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseLecture"
              }
            }
          }
        },
        "401": {
          description : "Request not granted - lecture belongs to a different user",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseUserUnauthorized"
              }
            }
          }
        },
        "404": {
          description : "Lecture content not found",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseResourceNotFound"
              }
            }
          }
        }
      }
    },
    delete : {
      tags : ["LMS Admin"],
      description : "Delete a lecture content",
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
  }
}