const router = require("express").Router();
const adminController = require("../controllers/admin");
const courseController = require("../controllers/course");
const sectionController = require("../controllers/section");
const lectureController = require("../controllers/lecture");
const schoolController = require("../controllers/school");
const instructorController = require("../controllers/instructor");
const categoryController = require("../controllers/category");

const {
  isAuthenticated,
  isAdmin,
  isSuperAdmin,
  isDumoAuthenticated,
  isDumoAuthorized,
  isSchoolAdmin,
  findSchool,
  fileStorage
} = require("../middleware");

router.get("/review",[ isAuthenticated, isAdmin ], adminController.getCoursesUnderReview);
router.get("/review/:courseId",[isAuthenticated, isAdmin],adminController.getCourseUnderReview);
router.post("/approve/:courseId",[isAuthenticated, isAdmin],  adminController.approve);
router.post("/disapprove/:courseId",[isAuthenticated, isAdmin], adminController.disapprove);
router.post("/feature/:courseId",[isAuthenticated, isAdmin], adminController.setFeaturedCourse);


router.patch("/new",[isAuthenticated, isSuperAdmin], adminController.addAdmin);
router.patch("/remove",[isAuthenticated, isSuperAdmin], adminController.removeAdmin);
router.get("/users",[isAuthenticated, isAdmin], adminController.getUsers);

router.post("/revert-to-draft", [isAuthenticated, isAdmin], adminController.revertCourseContentToDraft);

router.patch("/settings",[isAuthenticated, isAdmin], adminController.updateSettings);
// router.get("/analytics", [isAuthenticated, isAdmin], adminController.getPlatformAnalytics);
// router.get("/analytics", [findSchool, isAuthenticated, isAdmin], adminController.getAnalytics);
router.get("/transactions", [isAuthenticated, isAdmin], adminController.getTransactions);


/* ---- NEW ---- */

/* COURSES */
router.post("/schools", isDumoAuthenticated, schoolController.createSchool);
router.get("/schools", isDumoAuthenticated, schoolController.getSchools);
router.get("/schools/:schoolId", [findSchool, isDumoAuthenticated], schoolController.getSchool);
router.patch("/schools/:schoolId", [findSchool, isDumoAuthenticated, isSchoolAdmin], schoolController.updateSchool);
router.post("/schools/:schoolId/courses", [findSchool, isDumoAuthenticated, isSchoolAdmin], courseController.create);

router.patch("/schools/:schoolId/courses/:courseId", [
  findSchool,
  isDumoAuthenticated,
  isSchoolAdmin,
  isDumoAuthorized,
  // fileStorage(["jpg","JPG","jpeg","JPEG","png","PNG","gif","GIF"])
], courseController.update);

router.post("/schools/:schoolId/courses/:courseId/submit",[findSchool, isDumoAuthenticated, isSchoolAdmin, isDumoAuthorized], instructorController.submitForReview);
router.post("/schools/:schoolId/courses/:courseId/new-revision",[findSchool, isDumoAuthenticated, isSchoolAdmin, isDumoAuthorized], courseController.createNewRevision);

/* ADMIN */
router.post("/schools/:schoolId/courses/:courseId/approve", [findSchool, isDumoAuthenticated, isSchoolAdmin], adminController.approve);
router.post("/schools/:schoolId/courses/:courseId/disapprove",[findSchool, isDumoAuthenticated, isSchoolAdmin], adminController.disapprove);

router.get("/schools/:schoolId/analytics", [findSchool, isDumoAuthenticated], adminController.getAnalytics);
router.get("/schools/:schoolId/courses/live", [findSchool, isDumoAuthenticated, isSchoolAdmin], courseController.getLiveCourses);
router.get("/schools/:schoolId/courses/review", [findSchool, isDumoAuthenticated, isSchoolAdmin], adminController.getCoursesUnderReview);
router.get("/schools/:schoolId/courses/featured", [findSchool, isDumoAuthenticated, isSchoolAdmin], adminController.getFeaturedCourses);
router.get("/schools/:schoolId/courses/all",[findSchool, isDumoAuthenticated, isSchoolAdmin], adminController.getAllCourses);
router.get("/schools/:schoolId/courses/draft",[findSchool, isDumoAuthenticated, isSchoolAdmin], adminController.getDraftCourses);
router.post("/schools/:schoolId/courses/:courseId/publish",[findSchool, isDumoAuthenticated, isSchoolAdmin, isDumoAuthorized], adminController.publishCourse);
router.get("/schools/:schoolId/courses/:courseId",[findSchool, isDumoAuthenticated, isSchoolAdmin, isDumoAuthorized], adminController.getSingleCourse);

/* SECTIONS */
router.post("/schools/:schoolId/sections",[findSchool, isDumoAuthenticated, isSchoolAdmin], sectionController.create);
router.patch("/schools/:schoolId/sections/:sectionId",[findSchool, isDumoAuthenticated, isSchoolAdmin, isDumoAuthorized], sectionController.update);
router.delete("/schools/:schoolId/sections/:sectionId",[findSchool, isDumoAuthenticated, isSchoolAdmin, isDumoAuthorized], sectionController.delete);

/* LECTURES */
router.post("/schools/:schoolId/sections/:sectionId/lectures",[findSchool, isDumoAuthenticated, isSchoolAdmin, isDumoAuthorized], lectureController.create);
router.patch("/schools/:schoolId/sections/:sectionId/lectures/:lectureId",[findSchool, isDumoAuthenticated, isSchoolAdmin, isDumoAuthorized], lectureController.update);
router.delete("/schools/:schoolId/sections/:sectionId/lectures/:lectureId",[findSchool, isDumoAuthenticated, isSchoolAdmin, isDumoAuthorized], lectureController.delete);

/* Lecture content*/
let lectureContentFileTypes = ["mp4","mp3","ogg","webm","pdf"];

router.post("/schools/:schoolId/lectures/:lectureId/content",[
  findSchool, isDumoAuthenticated, isSchoolAdmin, isDumoAuthorized,
  // fileStorage(lectureContentFileTypes)
], lectureController.createContent);

// router.post("/schools/:schoolId/lectures/:lectureId/content2",[
//   findSchool, isDumoAuthenticated, isSchoolAdmin, isDumoAuthorized,
//   fileStorage()
// ], lectureController.createSpacesContent);

router.patch("/schools/:schoolId/lectures/:lectureId/content/:contentId",[
  findSchool,isDumoAuthenticated, isSchoolAdmin, isDumoAuthorized,
  // fileStorage(lectureContentFileTypes)
], lectureController.updateContent);

router.delete("/schools/:schoolId/lectures/:lectureId/content/:contentId",[findSchool,isDumoAuthenticated, isSchoolAdmin, isDumoAuthorized], lectureController.deleteContent);


/* CATEGORIES */
router.get("/schools/:schoolId/categories", [findSchool, isDumoAuthenticated, isSchoolAdmin], categoryController.getAllSchoolCategories);
router.get("/schools/:schoolId/categories/parent", [findSchool, isDumoAuthenticated, isSchoolAdmin], categoryController.getParentSchoolCategories);
router.get("/schools/:schoolId/categories/:categoryId", [findSchool, isDumoAuthenticated, isSchoolAdmin], categoryController.getSchoolSubcategories);


/* SETTINGS */
router.get("/schools/:schoolId/settings/payment/providers",[findSchool, isDumoAuthenticated, isSchoolAdmin], adminController.getPaymentProviders);
router.get("/schools/:schoolId/settings/payment/schoolProviders",[findSchool, isDumoAuthenticated, isSchoolAdmin], adminController.getSchoolPaymentProviders);
router.patch("/schools/:schoolId/settings/payment/:providerId",[findSchool, isDumoAuthenticated, isSchoolAdmin], adminController.setupPaymentProvider);
router.patch("/schools/:schoolId/settings/payment/:schoolProviderId/activate", [findSchool, isDumoAuthenticated, isSchoolAdmin], adminController.activatePaymentProvider);
router.patch("/schools/:schoolId/settings/payment/:schoolProviderId/deactivate", [findSchool, isDumoAuthenticated, isSchoolAdmin], adminController.deactivatePaymentProvider);
router.patch("/schools/:schoolId/settings/affiliates/activate", [findSchool, isDumoAuthenticated, isSchoolAdmin], adminController.activateAffiliateSales);
router.patch("/schools/:schoolId/settings/affiliates/deactivate", [findSchool, isDumoAuthenticated, isSchoolAdmin], adminController.deActivateAffiliateSales);

/*
* USERS
* */
router.get("/schools/:schoolId/users", [findSchool, isDumoAuthenticated, isSchoolAdmin], adminController.getUsers);
router.get("/schools/:schoolId/users/:userId", [findSchool, isDumoAuthenticated, isSchoolAdmin], adminController.getSingleUser);
router.post("/schools/:schoolId/users/:userId/courses/:courseId/enroll", [findSchool, isDumoAuthenticated, isSchoolAdmin], adminController.enrollUserToCourse);

module.exports = router;
