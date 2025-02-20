let string = "string";
let object = "object";
let integer = "integer";
let array = "array";
let boolean = "boolean";


module.exports = {
  "/lectures": {
    post : {
      tags : ["Lectures"],
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
  "/lectures/{lectureId}": {
    patch : {
      tags : ["Lectures"],
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
      tags : ["Lectures"],
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
  "/lectures/:lectureId/video":{
    patch : {
      tags : ["Admin"],
      description : "Change a lecture's video URL (to a youtube link)",
      requestBody : {
        required : true,
        content : {
          "application/json": {
            schema : {
              type : object,
              properties : {
                url : {
                  type : string
                }
              }
            }
          }
        }
      },
      responses : {
        "200": {
          content : {
            "application/json" : {
              schema : {
                $ref : "#/components/responses/GenericResponseLecture"
              }
            }
          }
        }
      }
    }
  }
};