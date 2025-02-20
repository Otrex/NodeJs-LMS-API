let string = "string";
let object = "object";
let integer = "integer";
let array = "array";
let boolean = "boolean";

module.exports = {
  "public/transaction" : {
    post : {
      tags : ["Transactions"],
      description : "Create a transaction",
      requestBody : {
        required : true,
        content : {
          "application/json": {
            schema : {
              type : object,
              properties : {
                paymentGateway : {
                  type : string,
                  example : "paystack"
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
          description : "transaction created successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseTransaction"
              }
            }
          }
        }
      }
    }
  },
  "public/transaction/verify/{transactionRef}" : {
    get : {
      tags: ["Transactions"],
      description: "Verify a paystack transaction",
      parameters: [
        {
          $ref : "#/components/parameters/affiliateReferralCode"
        }
      ],
      responses : {
        "200": {
          description : "transaction verified successfully",
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
  "public/transaction/providers" : {
    get : {
      tags : ["Transactions"],
      description : "List payment service providers - paystack, etc",
      responses : {
        "200": {
          description : "Payment service providers retrieved successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponsePaymentProviders"
              }
            }
          }
        }
      }
    }
  }
};