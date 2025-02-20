const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const requestLogger = require("morgan");
const databaseUtils = require("./config/database/utils");
const path = require("path");
require("dotenv").config();
const { errorHandler,endpointNotFoundHandler, findSchool } = require("./middleware");

const userRoutes = require("./routes/user");
const courseRoutes = require("./routes/course");
const categoryRoutes = require("./routes/category");
const sectionRoutes = require("./routes/section");
const mediaRoutes = require("./routes/media");
const lectureRoutes = require("./routes/lecture");
const instructorRoutes = require("./routes/instructor");
const adminRoutes = require("./routes/admin");
const supportRoutes = require("./routes/support");
const transactionRoutes = require("./routes/transaction");
const cartRoutes = require("./routes/cart");
const schoolRoutes = require("./routes/school");
const publicRoutes = require("./routes/public");
const swaggerDocRoutes = require("./routes/documentation");
const affiliateRoutes = require("./routes/affiliate");

const authService = require("./services/auth");
const transactionService = require("./services/transaction");
const cronJobs = require("./cron");
const devRoutes = require("./routes/dev");
const utils = require("./utils");

const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

app.use(requestLogger("combined",{
  skip : (req,res) => process.env.NODE_ENV == "test" })
);

app.set("trust proxy", true);

app.use("/media", express.static(path.join(__dirname,"..","media")));
// app.use("/users",userRoutes);
app.use("/categories",categoryRoutes);
// app.use("/courses",courseRoutes);
app.use("/sections",sectionRoutes);
app.use("/media", mediaRoutes);
// app.use("/lectures", lectureRoutes);
app.use("/instructors",instructorRoutes);
app.use("/admin", adminRoutes);
// app.use("/transaction", transactionRoutes);
app.use("/support", supportRoutes);
// app.use("/cart", cartRoutes);
app.use("/schools", schoolRoutes);

app.use("/public", publicRoutes);

app.use("/dev", devRoutes);

app.use("/documentation",swaggerDocRoutes);


app.get("/", (req, res) => {
  res.send({ status: "success", message: "DUMO LMS API" });
});

app.use(errorHandler);
app.use(endpointNotFoundHandler);


app.init = () => {
  databaseUtils.createCourseCategories();
  databaseUtils.createPaymentProviders();
  // databaseUtils.createSuperAdmin();
  // databaseUtils.createSettings();
  // cronJobs.init();
  app.listen(process.env.PORT,() => {
    console.log(`DUMO LMS API server running on port ${process.env.PORT}`);
  });
};

app.init();

module.exports = app;
