require("dotenv").config();
const { expect } = require("chai");
const utils = require("../../src/utils");
process.env.NODE_ENV = "test";

describe("[==== UNIT TESTS ====]",() => {
  describe("generateToken()",() => {
    it("Returns a random 32-character long string",() => {

      let token = utils.generateToken();

      expect(token).to.be.a("string").and.have.lengthOf(32);
    });
  });

  describe("writeToFile()",() => {
    let testError = new Error("This error is a test error");
    let errorLogFile = "./logs/errors.log";

    context("@param filePath is passed into the function",() => {
      it("Logs the error to the provided path",() => {
        expect(() => utils.writeToFile(testError,errorLogFile)).to.not.throw();
      });
    });

    context("@param filePath is not passed into the function",() => {
      it("Logs the error to the default error log file",() => {
        expect(() => utils.writeToFile(testError)).to.not.throw();
      });

    });
  });

  describe("hashPassword()",() => {
    it("Hashes a plain text password",async() => {
      let plainTextPassword = "somerandompassword";
      let hashedPassword = await utils.hashPassword(plainTextPassword);
      expect(hashedPassword).to.be.lengthOf(60);
    });
  });

  describe("comparePasswords()",() => {
    let password = "somerandompassword";
    let incorrectPassword = "awrongpassword";
    let hashedPassword;

    utils.hashPassword(password)
      .then((hash) => {
        hashedPassword = hash;
      });

    context("Password is correct",() => {
      it("Returns true",async() => {
        let passwordsMatch = await utils.comparePasswords(password,hashedPassword);
        expect(passwordsMatch).to.equal(true);
      });
    });
    context("Password is incorrect",() => {
      it("Returns false",async() => {
        let passwordsMatch = await utils.comparePasswords(incorrectPassword,incorrectPassword);
        expect(passwordsMatch).to.equal(false);
      });
    });
  });

  describe("sendMail()",() => {
    it("Sends mails to users", async() => {
      let mail = "adimvicky@gmail.com";
      let subject = "Test Mail";
      let text = "Test message";

      let mailResult = await utils.sendMail(mail,subject,text);

      expect(mailResult).to.not.be.an("error");
      expect(mailResult).to.be.an("array");
    });
  });

  describe("Bearer token signing and verification",() => {

    let tokenData = { userId : "901efe-hdsdskd-jsdsjd" };
    let signedToken;

    describe("signAuthToken()", () => {
      it("Signs users' Bearer token",async() => {
        signedToken = await utils.signAuthToken(tokenData);

        expect(signedToken).to.be.a("string");
      });
    });

    describe("verifyAuthToken()",() => {
      it("Verifies a users' Bearer token", async() => {
        let verifiedUserToken = await utils.verifyAuthToken(signedToken);

        expect(verifiedUserToken).to.include(tokenData);
      });
    });
  });
});