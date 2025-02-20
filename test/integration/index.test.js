const database = require("../../src/models");
const { expect } = require("chai");
process.env.NODE_ENV = "test";

describe("[==== INTEGRATION TESTS ====]",() => {
  describe("database.create()", () => {
    it("Creates/Modifies the database tables",async() => {

      expect(database.create.bind(this,() => {})).to.not.throw();

    });
  });
});