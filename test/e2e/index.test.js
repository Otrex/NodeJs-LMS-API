const { expect }= require("chai");
const request = require("supertest");
const app = require("../../src/app");
const { Context } = require("mocha");
process.env.NODE_ENV = "test";

let userPassword = "adim";
let userData = {
  firstName : "Adim",
  lastName : "Onwosi",
  email : `user@${(Math.random()+1).toString(36).substr(2, 5)}.com`,
  password : userPassword
};

describe("[==== E2E TESTS ====]",() => {
  describe("Get /",() => {
    it("Responds with status 200 and JSON", (done) => {

      request(app)
        .get("/")
        .expect(200)
        .expect((res) => {
          expect(res.body).to.include({ success : true });
        })
        .end(done);
    });

  });
  describe("Register",() => {
    it("Creates a new user account",(done) => {

      request(app)
        .post("/users/register")
        .send(userData)
        .expect(201)
        .expect((res) => {
          expect(res.body).to.include({ success : true }).and.to.have.keys(["data"]);
          userData = res.body.data;
        })
        .end(done);
    });

  });
  describe("Login", () => {
    context("Password is incorrect",() => {
      it("User gets a 400 response",(done) => {

        request(app)
          .post("/users/login")
          .send({ email : userData.email, password : "wrongpassword" })
          .expect(400)
          .expect((res) => {
            expect(res.body).to.include({ success : false });
          })
          .end(done);
      });
    });
    context("Password is correct",() => {
      it("User gets logged in",(done) => {

        request(app)
          .post("/users/login")
          .send({ email : userData.email, password : userPassword })
          .expect(200)
          .expect((res) => {
            expect(res.body).to.include({ success : true }).and.to.have.nested.property("data.token");

            userData = res.body.data;
          })
          .end(done);
      });
    });

  });
});