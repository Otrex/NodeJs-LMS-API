const {
  user:User,
  defaultCategory:DefaultCategory,
  paymentProvider: PaymentProvider,
  setting:Setting
} = require("./models");
const seedData = require("./seed.json");
const courseCategoriesData = require("./courseCategories.json");
const models = require("./models");

module.exports = {
  seed : () => {
    for(let model in seedData){
      models[model].bulkCreate(seedData[model])
        .then(createdData => {
          console.log(`${model} table seeded with data => ${JSON.stringify(createdData)}`);
        })
        .catch(e => {
          console.log(`An error occurred seeding the ${model} table => ${e}`);
        });
    }
  },
  createCourseCategories : async() => {
    console.log("!! You just ran the createCourseCategories function - this should only be run once !!");
    // Create the course categories - this function should only be run once
    let existingCategories = await DefaultCategory.findAll({where:{}});
    if(existingCategories.length){
      console.log('[Aborting defaultCategory creation] - Default Categories already exist');
      return;
    } else {
      for(let defaultCategory in courseCategoriesData){
        DefaultCategory.create({ name : defaultCategory })
          .then((createdCategory) => {
            let subCategoriesData = courseCategoriesData[defaultCategory].map((subCategory) => {
              return { name : subCategory, parentCategoryId : createdCategory.uuid };
            });
            DefaultCategory.bulkCreate(subCategoriesData)
              .then(createdSubCategories => {
                console.log(`${defaultCategory} course defaultCategory subcategories created`);
              })
              .catch(e => {
                console.log(`An error occurred creating subcategories for ${defaultCategory} => `,e);
              });
          })
          .catch(e => {
            console.log(`An error occurred creating a parent defaultCategory- ${defaultCategory} => `,e);
          });
      }
    }
  },
  createSuperAdmin : async() => {
    // let email = "admin@acadabay.com";
    // let password = await require("../../utils").hashPassword("01acadmin");

    // User.findOrCreate({ where : { email, role : "superadmin" } })
    //   .then(user => {
    //     user = user[0];
    //     user.password = password;
    //     user.firstName = "Acadabay";
    //     user.lastName = "Admin";
    //     user.save()
    //       .then(() => {
    //         console.log("Super Admin created --");
    //       })
    //       .catch(err => {
    //         console.log("An error occurred creating an super admin => ",err);
    //       });
    //   })
    //   .catch(err => {
    //     console.log("An error occurred creating an super admin => ",err);
    //   });
  },
  createPaymentProviders : () => {
    PaymentProvider.findOrCreate({ where : { name : "paystack" } })
      .then(provider => {
        console.log(`Payment provider '${provider[0].name}' created`);
      })
      .catch(e => {
        console.log("An error occurred creating a payment provider => ", e);
      });
    
      PaymentProvider.findOrCreate({ where : { name : "monnify" } })
      .then(provider => {
        console.log(`Payment provider '${provider[0].name}' created`);
      })
      .catch(e => {
        console.log("An error occurred creating a payment provider => ", e);
      });
  },
  createSettings: () => {

    let initialSettings = {
      coursePricePercentage : 20
    };

    Setting.findOne({ where : {} })
      .then(settings => {
        if(settings){
          console.log(`Existing settings => ${settings.get()}`);
          return;
        } else {
          Setting.create(initialSettings)
            .then(createdSetting => {
              console.log(`Settings created => ${createdSetting.get()}`);
            })
            .catch(e => {
              console.log("An error occurred creating settings");
            });
        }
      })
      .catch(e => {
        console.log("An error occurred creating settings");
      });
  }
};