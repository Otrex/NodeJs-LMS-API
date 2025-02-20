const utils = require("../utils");
const {
  category:Category,
  media : Media,
} = require("../config/database/models");

module.exports = {
  getAllCategories : (req,res,next) => {
    Category.findAll({
      where : { parentCategoryId : null },
      include : [
        { model : Category, as : "subcategories" },
        { model : Media, as : "icon", attributes : ["url"] }
      ]
    })
      .then(categories => {
        if(categories){
          return res.send({ success : true, message : "Successfully retrieved categories", data : categories });
        } else {
          return res.send(404).send({ success : false, message : "Could not retrieve course categories" });
        }
      })
      .catch(next);
  },
  getParentCategories : (req,res,next) => {
    Category.findAll({
      where : { parentCategoryId : null },
      include : [{ model : Media, as : "icon", attributes : ["url"] }]
    })
      .then(categories => {
        if(categories){
          return res.send({ success : true, message : "Successfully retrieved categories", data : categories });
        } else {
          return res.send(404).send({ success : false, message : "Could not retrieve course categories" });
        }
      })
      .catch(next);
  },
  getSubcategories : (req,res,next) => {
    let { categoryId } = req.params;
    Category.findAll({ where : { parentCategoryId:categoryId } })
      .then(subcategories => {
        if(subcategories){
          return res.send({ success : true, message : "Successfully retrieved categories", data : subcategories });
        } else {
          return res.send(404).send({ success : false, message : "Could not retrieve course categories" });
        }
      })
      .catch(next);
  },
  create : async(req,res,next) => {
    let fieldsValid = utils.validateReqFields(req,res,["name"]);
    if(fieldsValid){
      let { name, parentCategoryId } = req.body;
      let categoryData = { name };
      if(parentCategoryId){
        let parentCategoryExists = await Category.findOne({ where : { uuid : parentCategoryId } });
        if(parentCategoryExists){
          categoryData.parentCategoryId = parentCategoryId;
        } else {
          return res.status(400).send({ success : false, message : "Chosen parent category not found" });
        }
      }
      Category.create(categoryData)
        .then(createdCategory => {
          if(req.file){
            Media.create({ url : req.file.filename,categoryId : createdCategory.uuid })
              .then(media => {
                console.log(`Created Icon => ${media.get()}`);
              })
              .catch(next);
          }
          res.send({ success : true, message : "Category created", data : createdCategory });
        })
        .catch(next);
    }
  },
  update : (req,res,next) => {
    let { categoryId } = req.params;
    Category.findOne({ where : { uuid : categoryId } })
      .then(category => {
        if(category){
          for(let field in req.body){
            category[field] = req.body[field];
          }
          category.save()
            .then(category => {
              if(req.file){
                Media.create({ url : req.file.filename })
                  .then(media => {
                    category.setIcon(media.uuid);
                    // @TODO Delete old category icon if any (from DB and file system)
                    console.log(`Created Icon => ${media.get()}`);
                  })
                  .catch(next);
              }
              return res.send({ success : true, message : "Category updated successfully",data : category });
            })
            .catch(next);
        } else {
          return res.status(404).send({ success : false, message : "Category not found" });
        }
      })
      .catch(next);
  },
  delete : (req,res,next) => {
    let { categoryId } = req.params;
    Category.destroy({ where : { uuid : categoryId } })
      .then(result => {
        if(result){
          return res.send({ success : true, message : "Category deleted" });
        }
        res.status(404).send({ success : true, message : "Category not found" });
      })
      .catch(next);
  },


  /* NEW ADMIN ENDPOINTS */
  getAllSchoolCategories : (req,res,next) => {
    Category.findAll({
      where : { parentCategoryId: null, schoolId: req.school.uuid },
      include : [
        { model : Category, as : "subcategories" },
        { model : Media, as : "icon", attributes : ["url"] }
      ]
    })
      .then(categories => {
        if(categories){
          return res.send({ success : true, message : "Successfully retrieved categories", data : categories });
        } else {
          return res.send(404).send({ success : false, message : "Could not retrieve course categories" });
        }
      })
      .catch(next);
  },
  getParentSchoolCategories : (req,res,next) => {
    Category.findAll({
      where : { parentCategoryId : null, schoolId: req.school.uuid },
      include : [{ model : Media, as : "icon", attributes : ["url"] }]
    })
      .then(categories => {
        if(categories){
          return res.send({ success : true, message : "Successfully retrieved categories", data : categories });
        } else {
          return res.send(404).send({ success : false, message : "Could not retrieve course categories" });
        }
      })
      .catch(next);
  },
  getSchoolSubcategories : (req,res,next) => {
    let { categoryId } = req.params;
    Category.findAll({ where : { parentCategoryId:categoryId, schoolId: req.school.uuid } })
      .then(subcategories => {
        if(subcategories){
          return res.send({ success : true, message : "Successfully retrieved categories", data : subcategories });
        } else {
          return res.send(404).send({ success : false, message : "Could not retrieve course categories" });
        }
      })
      .catch(next);
  },

};