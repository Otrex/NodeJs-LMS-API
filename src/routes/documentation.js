const router = require("express").Router();
const swaggerUi = require("swagger-ui-express");
const routesDocumentation = require("../../documentation");

router.use("/",swaggerUi.serve);
router.get("/", swaggerUi.setup(routesDocumentation,{ explorer: true }));

module.exports = router;