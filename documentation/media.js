let string = "string";
let object = "object";
let integer = "integer";
let array = "array";
let boolean = "boolean";


module.exports = {
  "/media": {
    post : {
      tags : ["Upload"],
      description : "Upload a course content, course image, profile picture, etc",
      requestBody : {
        required : true,
        content : {
          "multipart/form-data": {
            schema : {
              type : object,
              properties : {
                media : {
                  description : "The file [video, image, etc] being uploaded (Note: max file size = 300MB)"
                }
              }
            }
          }
        }
      },
      responses : {
        "200": {
          description : "Content uploaded successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseMedia"
              }
            }
          }
        }
      }
    }
  }
};

