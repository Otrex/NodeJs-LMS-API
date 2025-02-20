let string = "string";
let object = "object";
let integer = "integer";
let array = "array";
let boolean = "boolean";

module.exports = {
  "/support/ticket" : {
    post : {
      tags : ["Support"],
      description : "Create support ticket",
      requestBody : {
        required : true,
        content : {
          "application/json": {
            schema : {
              type : object,
              properties : {
                subject : {
                  type : string,
                  description : "Subject/heading"
                },
                message : {
                  type : string,
                  description : "Main body of the ticket"
                }
              }
            }
          }
        },
      },
      responses : {
        "200": {
          description : "Ticket created",
          content : {
            "application/json":{
              schema : {
                $ref : "#/components/responses/GenericResponse"
              }
            }
          }
        }
      }
    },
    get: {
      tags : ["Support"],
      description : "Get support tickets",
      parameters: [
        {
          $ref : "#/components/parameters/page"
        },
        {
          $ref : "#/components/parameters/limit"
        }
      ],
      responses : {
        "200": {
          description : "Tickets retrieved",
          content : {
            "application/json":{
              schema : {
                $ref : "#/components/responses/GenericResponse"
              }
            }
          }
        }
      }
    }
  },
  "/support/ticket/{ticketId}/reply": {
    post: {
      tags : ["Support","Admin"],
      description : "Reply a support ticket",
      parameters: [],
      responses : {
        "200": {
          description : "Ticket replied",
          content : {
            "application/json":{
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