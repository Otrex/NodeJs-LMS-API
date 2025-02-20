let string = "string";
let object = "object";
let integer = "integer";
let array = "array";
let boolean = "boolean";

module.exports = {
  "/categories": {
    get : {
      security : [],
      tags : ["Categories"],
      description : "Get all course categories and their subcategories",
      responses : {
        "200": {
          description : "Categories retrieved successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseParentCategories"
              }
            }
          }
        }
      }
    },
    post : {
      tags : ["Categories","Admin"],
      description : "Create a category",
      requestBody : {
        required : true,
        content : {
          "multipart/form-data": {
            schema : {
              type : object,
              properties : {
                name : {
                  type : string
                },
                media : {
                  type : string,
                  format : "binary",
                  description : "Category svg icon file"
                },
                parentCategoryId : {
                  type : string,
                  format : "uuid",
                  description : "The parent category of the subcategory to be created. This field should not be sent when creating a parent Category "
                }
              }
            }
          }
        }
      },
      responses : {
        "200": {
          description : "Categories created",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseParentCategory"
              }
            }
          }
        }
      }
    }
  },
  "/categories/parent": {
    get : {
      security : [],
      tags : ["Categories"],
      description : "Get all parent course categories (Without their subcategories)",
      responses : {
        "200": {
          description : "Categories retrieved successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseCategories"
              }
            }
          }
        }
      }
    }
  },
  "/categories/{categoryId}": {
    get : {
      security : [],
      tags : ["Categories"],
      description : "Get course subcategories belonging to the parent category with id {categoryId}",
      parameters : [
        {
          $ref : "#/components/parameters/categoryId"
        }
      ],
      responses : {
        "200": {
          description : "subcategories retrieved successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseCategories"
              }
            }
          }
        }
      }
    },
    patch : {
      tags : ["Categories", "Admin"],
      description : "Update a category",
      parameters : [
        {
          $ref : "#/components/parameters/categoryId"
        }
      ],
      requestBody : {
        required : true,
        content : {
          "multipart/form-data": {
            schema : {
              type : object,
              properties : {
                name : {
                  type : string
                },
                media : {
                  type : string,
                  format : "binary",
                  description : "Category svg icon file"
                }
              }
            }
          }
        }
      },
      responses : {
        "200": {
          description : "Category updated successfully",
          content : {
            "application/json": {
              schema : {
                $ref : "#/components/responses/GenericResponseCategory"
              }
            }
          }
        },
        "404": {
          description : "Category not found",
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
      tags : ["Categories", "Admin"],
      description : "Delete a category",
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
};