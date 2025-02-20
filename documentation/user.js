let string = "string";
let object = "object";
let integer = "integer";
let array = "array";
let boolean = "boolean";

module.exports = {
  "public/users/register": {
    post: {
      security : [],
      tags: ["Users"],
      description: "Create a user account",
      operationId: "createUsers",
      parameters: [],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/User"
            }
          }
        },
        required: true
      },
      responses: {
        "201": {
          description: "New user account created",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseUser"
              },
            }
          }
        },
        "400": {
          description: "Invalid parameters",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/responses/GenericResponseInvalid"
              }
            }
          }
        },
        "409": {
          description: "Email already exists",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/responses/GenericResponseInvalid"
              }
            }
          }
        }
      }
    }
  },
  "public/users/login": {
    post : {
      security : [],
      tags : ["Users"],
      description : "User login",
      parameters : [],
      requestBody : {
        content : {
          "application/json": {
            schema : {
              type : object,
              properties : {
                email : {
                  type : string,
                  required : true
                },
                password : {
                  type : string,
                  required : true
                }
              }
            }
          }
        },
        required : true
      },
      responses : {
        "200": {
          description : "Login was successful",
          content : {
            "application/json":{
              schema : {
                $ref : "#/components/responses/GenericResponseUserToken"
              }
            }
          }
        },
        "400": {
          description : "Incorrect password",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseInvalid"
              }
            }
          }
        }
      }
    },
  },
  "/users/auth/google?authCode={authCode}": {
    post : {
      security : [],
      tags : ["Users"],
      description : "User sign in with Google",
      parameters : [
        {
          $ref : "#/components/parameters/authCode"
        }
      ],
      responses : {
        "200": {
          description : "Login was successful or Account created successfully",
          content : {
            "application/json":{
              schema : {
                $ref : "#/components/responses/GenericResponseUserToken"
              }
            }
          }
        },
        "500": {
          description : "Google sign in failed",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseServerError"
              }
            }
          }
        }
      }
    },
  },
  "/users/auth/facebook?authCode={authCode}": {
    post : {
      security : [],
      tags : ["Users"],
      description : "User sign in with Facebook",
      parameters : [
        {
          $ref : "#/components/parameters/authCode"
        }
      ],
      responses : {
        "200": {
          description : "Login was successful or Account created successfully",
          content : {
            "application/json":{
              schema : {
                $ref : "#/components/responses/GenericResponseUserToken"
              }
            }
          }
        },
        "500": {
          description : "Facebook sign in failed",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseServerError"
              }
            }
          }
        }
      }
    },
  },
  "public/users/profile" : {
    patch : {
      tags : ["Users"],
      description : "Update user profile - firstName, lastName etc",
      requestBody : {
        required : true,
        content : {
          "application/json": {
            schema : {
              $ref : "#/components/schemas/UserProfile"
            }
          }
        }
      },
      responses : {
        "200": {
          description : "User profile updated",
          content : {
            "application/json":{
              schema : {
                $ref : "#/components/responses/GenericResponse"
              }
            }
          }
        },
        "401": {
          description : "Unauthorized",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseUnauthorizedError"
              }
            }
          }
        }
      }
    }
  },
  "public/users/account" : {
    patch : {
      tags : ["Users"],
      description : "Change user account password or email",
      requestBody : {
        required : true,
        content : {
          "application/json": {
            schema : {
              type : object,
              properties : {
                password : {
                  type : string,
                  format : "password",
                  description : "User's current password",
                  required : true
                },
                newEmail : {
                  type : string,
                  format : "email",
                  description : "User's new chosen email (if they want to change that)"
                },
                newPassword : {
                  type : string,
                  format : "password",
                  description : "User's new chosen password (if they want to change that)"
                }
              }
            }
          }
        },
      },
      responses : {
        "200": {
          description : "User profile updated",
          content : {
            "application/json":{
              schema : {
                $ref : "#/components/responses/GenericResponse"
              }
            }
          }
        },
        "401": {
          description : "Unauthorized",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseUnauthorizedError"
              }
            }
          }
        },
        "409": {
          description: "new chosen Email already exists",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/responses/GenericResponseInvalid"
              }
            }
          }
        }
      }
    }
  },
  "public/users/account/forgot" : {
    post : {
      security : [],
      tags : ["Users"],
      description : "User forgot password - Here the user enters the email associated with their account",
      requestBody : {
        required : true,
        content : {
          "application/json": {
            schema : {
              type : object,
              properties : {
                email : {
                  type : string,
                  format : "email",
                  description : "Email associated with users' account"
                }
              }
            }
          }
        },
      },
      responses : {
        "200": {
          description : "An account recovery mail has been sent to the users' mail",
          content : {
            "application/json":{
              schema : {
                $ref : "#/components/responses/GenericResponse"
              }
            }
          }
        },
        "404": {
          description: "A user with the provided email does not exist",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/responses/GenericResponseInvalid"
              }
            }
          }
        }
      }
    }
  },
  "public/users/account/reset/{token}" : {
    post : {
      security : [],
      tags : ["Users"],
      description : "Reset user's password - Here, the user enters their new chosen password",
      requestBody : {
        required : true,
        content : {
          "application/json": {
            schema : {
              type : object,
              properties : {
                password : {
                  type : string,
                  format : "password",
                  description : "User's new chosen password"
                }
              }
            }
          }
        },

      },
      parameters : [
        {
          in : "path",
          name : "token",
          required : true
        }
      ],
      responses : {
        "200": {
          description : "User password was reset successfully",
          content : {
            "application/json":{
              schema : {
                $ref : "#/components/responses/GenericResponse"
              }
            }
          }
        },
        "404": {
          description: "A user with the provided account recovery token does not exist",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/responses/GenericResponseInvalid"
              }
            }
          }
        }
      }
    }
  },
  "public/users/account/verify/{token}" : {
    post : {
      security : [],
      tags : ["Users"],
      description : "User email address verification",
      parameters : [
        {
          in : "path",
          name : "token",
          required : true
        }
      ],
      responses : {
        "200": {
          description : "User email verified successfully",
          content : {
            "application/json":{
              schema : {
                $ref : "#/components/responses/GenericResponse"
              }
            }
          }
        },
        "404": {
          description: "A user with the provided email verification token does not exist",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/responses/GenericResponseInvalid"
              }
            }
          }
        }
      }
    }
  },
  "/users/newsletter/subscribe" : {
    post : {
      security : [],
      tags : ["Users"],
      description : "Subscribe to newsletter",
      requestBody : {
        required : true,
        content : {
          "application/json": {
            schema : {
              type : object,
              properties : {
                email : {
                  type : string,
                  format : "email",
                  description : "User's email"
                }
              }
            }
          }
        },
      },
      responses : {
        "200": {
          description : "Newsletter subscription was successful",
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
  "/users/bank/confirm" : {
    get : {
      tags : ["Users"],
      description : "Confirm bank account details are correct",
      requestBody : {
        required : true,
        content : {
          "application/json": {
            schema : {
              type : object,
              properties : {
                bankAccountNumber : {
                  type : string,
                  description : "User's bank account number"
                },
                bankCode : {
                  type : string,
                  description : "Code representing the user's bank - Get this from paystack's bank list API"
                }
              }
            }
          }
        },
      },
      responses : {
        "200": {
          description : "Confirmed",
          content : {
            "application/json":{
              schema : {
                type : object,
                properties : {
                  success : {
                    type : boolean
                  },
                  message: {
                    type: string
                  },
                  data: {
                    type: object,
                    properties: {
                      bankAccountNumber: {
                        type: string
                      },
                      bankAccountName: {
                        type: string
                      }
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
  "/users/bank/details" : {
    patch : {
      tags : ["Users"],
      description : "Update users' bank account details",
      requestBody : {
        required : true,
        content : {
          "application/json": {
            schema : {
              type : object,
              properties : {
                bankAccountNumber : {
                  type : string,
                  description : "User's bank account number"
                },
                bankAccountName : {
                  type : string,
                  description : "User's bank account name"
                },
                bankCode : {
                  type : string,
                  description : "Code representing the user's bank - Get this from paystack's bank list API"
                },
                bankName : {
                  type : string,
                  description : "Name of user's bank - Get this from paystack's bank list API"
                }
              }
            }
          }
        },
      },
      responses : {
        "200": {
          description : "Updated",
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
      tags : ["Users"],
      description : "Get users' bank account details",
      responses : {
        "200": {
          description : "Bank details retrieved",
          content : {
            "application/json":{
              schema : {
                type : object,
                properties : {
                  success: {
                    type: boolean
                  },
                  message: {
                    type: string
                  },
                  data: {
                    type: object,
                    properties: {
                      bankAccountNumber : {
                        type : string,
                        description : "User's bank account number"
                      },
                      bankAccountName : {
                        type : string,
                        description : "User's bank account name"
                      },
                      bankCode : {
                        type : string,
                        description : "Code representing the user's bank - Get this from paystack's bank list API"
                      },
                      bankName : {
                        type : string,
                        description : "Name of user's bank - Get this from paystack's bank list API"
                      }
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
  "/users/bank/list" : {
    get : {
      tags : ["Users"],
      description : "Get list of banks",
      responses : {
        "200": {
          description : "Banks retrieved",
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