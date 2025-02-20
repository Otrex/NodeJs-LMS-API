let string = "string";
let object = "object";
let integer = "integer";
let array = "array";
let boolean = "boolean";


module.exports = {
  "/sections": {
    post : {
      tags : ["Sections"],
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
  "/sections/{sectionId}": {
    patch : {
      tags : ["Sections"],
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
    },
    delete : {
      tags : ["Sections"],
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
    }
  }
};