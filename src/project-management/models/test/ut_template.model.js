require("module-alias/register");
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const chaiAsPromised = require("chai-as-promised");
const mongoose = require("mongoose");
const GrantModel = require("@models/Grant");
const httpStatus = require("http-status");
chai.use(chaiAsPromised);

describe("UserSchema static methods", () => {
  describe("list()", () => {
    let sandbox;

    before(() => {
      mongoose.set("useFindAndModify", false); // To suppress mongoose deprecation warnings
    });

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("should return user details with valid filter", async () => {
      // Create a mock response
      const mockResponse = [
        // Mock user data here
      ];

      // Create a mock aggregation object with expected methods
      const mockAggregation = {
        match: sandbox.stub().returnsThis(),
        lookup: sandbox.stub().returnsThis(),
        addFields: sandbox.stub().returnsThis(),
        unwind: sandbox.stub().returnsThis(),
        group: sandbox.stub().returnsThis(),
        project: sandbox.stub().returnsThis(),
        sort: sandbox.stub().returnsThis(),
        skip: sandbox.stub().returnsThis(),
        limit: sandbox.stub().returnsThis(),
        allowDiskUse: sandbox.stub().returnsThis(),
        exec: sandbox.stub().resolves(mockResponse), // Resolve with your mock data
      };

      // Stub the GrantModel.aggregate() method to return the mock aggregation object
      sandbox.stub(GrantModel, "aggregate").returns(mockAggregation);

      // Define the filter you want to test
      const filter = {
        // Define your filter here
      };

      // Call the list function and make assertions
      const result = await GrantModel.list({ filter });

      expect(result).to.deep.equal({
        success: true,
        message: "successfully retrieved the user details",
        data: mockResponse,
        status: httpStatus.OK,
      });
    });

    // Add more test cases here for different scenarios (e.g., empty response, error handling, etc.)
  });
});

describe("UserSchema instance methods", () => {
  describe("toAuthJSON()", () => {
    it("should return the JSON representation for authentication", () => {
      // Sample user document
      const user = new GrantModel({
        _id: "user_id_1",
        userName: "john_doe",
        email: "john@example.com",
        password: "password123",
      });

      // Call the toAuthJSON method
      const result = user.toAuthJSON();

      // Assertions
      expect(result).to.be.an("object");
      expect(result).to.have.property("_id", "user_id_1");
      expect(result).to.have.property("userName", "john_doe");
      expect(result).to.have.property("email", "john@example.com");
      expect(result).to.have.property("token");
      expect(result.token).to.be.a("string").and.to.include("JWT ");
    });

    // Add more test cases to cover other scenarios
  });
});
