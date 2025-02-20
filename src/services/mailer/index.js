const sendgrid = require("@sendgrid/mail");
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const templates = require("./templates");

module.exports.sendSchoolUserRegisteredMail = async function (params) {
  const {
    user,
    school
  } = params;
  if (!user || !school) {
    throw new Error("some parameters are missing");
  }
  const domain = school.domainName.replace("https://", "").replace("https://", "").replace(":", ".");
  const options = {
    from: {
      email: `no-reply@${domain}`,
      name: school.name
    },
    to: user.email,
    subject: "Welcome",
    html: templates["school.account.created"].body
  };
  return await sendgrid.send(options);
};

module.exports.sendCourseEnrolmentMail = async function (params) {
  const {
    user,
    course,
    school
  } = params;
  if (!user || !course || !school) {
    throw new Error("some parameters are missing");
  }
  const domain = school.domainName.replace("https://", "").replace("https://", "").replace(":", ".");
  const options = {
    from: {
      email: `no-reply@${domain}`,
      name: school.name
    },
    to: user.email,
    subject: "Course Enrolled",
    text: course.activeCourseRevision.welcomeMessage
  };
  return await sendgrid.send(options);
};

module.exports.sendAffiliateSalesMail = async function (params) {
  const {
    user,
    course,
    school,
    commissionAmount
  } = params;
  if (!user || !course || !school || !commissionAmount) {
    throw new Error("some parameters are missing");
  }
  const domain = school.domainName.replace("https://", "").replace("https://", "").replace("localhost:3000", "vendyrr.io");
  console.log(">> school domain: ", domain);
  const options = {
    from: {
      email: `no-reply@${domain}`,
      name: school.name
    },
    to: user.email,
    subject: templates["affiliate.sale"].subject,
    html: templates["affiliate.sale"].body
      .replace("{{ firstName }}", user.firstName)
      .replace("{{ courseName }}", course.activeCourseRevision.title)
      .replace("{{ commissionAmount }}", commissionAmount)
  };
  return await sendgrid.send(options);
};


