const commonFields = {
  from_name: "Cloud",
  from_email: "noreply@cloud"
};

module.exports = {
  ["school.account.created"]: {
    ...commonFields,
    subject: "Welcome",
    body: `
      <p>
        Hello,
        <br>
        <br>
        I'm totally grateful that you signed up to learn on our platform. It gives me great excitement to see you reading this email.
        <br>
        <br>
        As you may have already seen, you've got access to any course for life when you buy and we guarantee value for your money. Our courses are designed with utmost value in mind and concepts are explained in very simple ways like it's done to toddlers.
        <br>
        <br>
        We will grow to become a platform where the best of the best will teach others to become excellent at what they do.
        <br>
        <br>
        Browse through, select courses, purchase and begin your learning journey. 
        <br>
        <br>
        Here's the good news. By signing up, you will see that for each course, there's an affiliate link attached. Copy the link and with it you can make money from us when your friends, followers and family purchase through the link.
        <br>
        <br>
        We offer you 50% for any course you sell. Yes, 50%. So if a course is N50,000, you make N25,000 from us. Beautiful, right?
        <br>
        <br>
        Welcome aboard. I look forward to your swell time here.
        <br>
        <br>
        Emeka Nobis
        <br>
        Founder, emekanobis.com
      </p>
    `
  },
  ["affiliate.sale"]: {
    ...commonFields,
    subject: "Welcome",
    body: `                                                               
<h1 style="font-size: 20px; text-align: left;">Hello {{ firstName }},</h1>
<p style="font-size: 16px;">
    You have made a sale for <b>{{ courseName }}</b> successfully.
    <br>
    <br>
    You earn ₦{{ commissionAmount }} commission on this sale.
    <br><br>
    Keep up the good work and keep on selling. 
    <br><br>
    Emeka Nobis 
    <br>Founder, emekanobis.com
    <br>
</p>                                     
    `
  },
  ["school.course.enrolled"]: {
    ...commonFields,
    subject: "Course Enrolled",
    body: `
      {{ welcomeMessage }}
    `
  },
};
