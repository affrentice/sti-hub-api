require("module-alias/register");
const { expect } = require("chai");
const sinon = require("sinon");
const httpStatus = require("http-status");
const { validationResult } = require("express-validator");
const createDepartment = require("@controllers/create-department");
const controlAccessUtil = require("@utils/control-access");

describe("createDepartment module", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("list()", () => {
    it("should list departments successfully", async () => {
      const req = {
        query: { tenant: "sti" },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      const validationResultStub = sinon
        .stub(validationResult, "isEmpty")
        .returns(true);
      const controlAccessUtilStub = sinon
        .stub(controlAccessUtil, "listDepartment")
        .resolves({
          success: true,
          status: httpStatus.OK,
          message: "Departments listed successfully",
          data: [{ name: "Department A" }, { name: "Department B" }],
        });

      await createDepartment.list(req, res);

      expect(validationResultStub.calledOnce).to.be.true;
      expect(controlAccessUtilStub.calledOnceWith(req)).to.be.true;
      expect(res.status.calledOnceWith(httpStatus.OK)).to.be.true;
      expect(
        res.json.calledOnceWith({
          success: true,
          message: "Departments listed successfully",
          departments: [{ name: "Department A" }, { name: "Department B" }],
        })
      ).to.be.true;
    });

    it("should handle list failure", async () => {
      const req = {
        query: { tenant: "sti" },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      const validationResultStub = sinon
        .stub(validationResult, "isEmpty")
        .returns(true);
      const controlAccessUtilStub = sinon
        .stub(controlAccessUtil, "listDepartment")
        .resolves({
          success: false,
          status: httpStatus.INTERNAL_SERVER_ERROR,
          message: "Failed to list departments",
          errors: { message: "Department listing error" },
        });

      await createDepartment.list(req, res);

      expect(validationResultStub.calledOnce).to.be.true;
      expect(controlAccessUtilStub.calledOnceWith(req)).to.be.true;
      expect(res.status.calledOnceWith(httpStatus.INTERNAL_SERVER_ERROR)).to.be
        .true;
      expect(
        res.json.calledOnceWith({
          success: false,
          message: "Failed to list departments",
          errors: { message: "Department listing error" },
        })
      ).to.be.true;
    });

    it("should handle bad request errors", async () => {
      const req = {
        query: { tenant: "sti" },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      const validationResultStub = sinon
        .stub(validationResult, "isEmpty")
        .returns(false);
      const badRequestStub = sinon.stub().returns({
        badRequest: sinon.stub(),
      });

      await createDepartment.list(req, res);

      expect(validationResultStub.calledOnce).to.be.true;
      expect(
        badRequestStub.calledOnceWith(res, "bad request errors", {
          nestedErrors: [],
        })
      ).to.be.true;
    });

    it("should handle unexpected errors", async () => {
      const req = {
        query: { tenant: "sti" },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      const validationResultStub = sinon
        .stub(validationResult, "isEmpty")
        .throws(new Error("Some unexpected error"));

      await createDepartment.list(req, res);

      expect(validationResultStub.calledOnce).to.be.true;
      expect(res.status.calledOnceWith(httpStatus.INTERNAL_SERVER_ERROR)).to.be
        .true;
      expect(
        res.json.calledOnceWith({
          success: false,
          message: "Internal Server Error",
          errors: { message: "Some unexpected error" },
        })
      ).to.be.true;
    });
  });
  describe("create()", () => {
    afterEach(() => {
      sinon.restore();
    });

    it("should create a department successfully", async () => {
      const req = {
        query: { tenant: "sti" },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      const validationResultStub = sinon
        .stub(validationResult, "isEmpty")
        .returns(true);
      const controlAccessUtilStub = sinon
        .stub(controlAccessUtil, "createDepartment")
        .resolves({
          success: true,
          status: httpStatus.OK,
          message: "Department created successfully",
          data: { name: "New Department" },
        });

      await createDepartment.create(req, res);

      expect(validationResultStub.calledOnce).to.be.true;
      expect(controlAccessUtilStub.calledOnceWith(req)).to.be.true;
      expect(res.status.calledOnceWith(httpStatus.OK)).to.be.true;
      expect(
        res.json.calledOnceWith({
          success: true,
          message: "Department created successfully",
          created_department: { name: "New Department" },
        })
      ).to.be.true;
    });

    it("should handle department creation failure", async () => {
      const req = {
        query: { tenant: "sti" },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      const validationResultStub = sinon
        .stub(validationResult, "isEmpty")
        .returns(true);
      const controlAccessUtilStub = sinon
        .stub(controlAccessUtil, "createDepartment")
        .resolves({
          success: false,
          status: httpStatus.INTERNAL_SERVER_ERROR,
          message: "Failed to create department",
          errors: { message: "Department creation error" },
        });

      await createDepartment.create(req, res);

      expect(validationResultStub.calledOnce).to.be.true;
      expect(controlAccessUtilStub.calledOnceWith(req)).to.be.true;
      expect(res.status.calledOnceWith(httpStatus.INTERNAL_SERVER_ERROR)).to.be
        .true;
      expect(
        res.json.calledOnceWith({
          success: false,
          message: "Failed to create department",
          errors: { message: "Department creation error" },
        })
      ).to.be.true;
    });

    it("should handle bad request errors", async () => {
      const req = {
        query: { tenant: "sti" },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      const validationResultStub = sinon
        .stub(validationResult, "isEmpty")
        .returns(false);
      const badRequestStub = sinon.stub().returns({
        badRequest: sinon.stub(),
      });

      await createDepartment.create(req, res);

      expect(validationResultStub.calledOnce).to.be.true;
      expect(
        badRequestStub.calledOnceWith(res, "bad request errors", {
          nestedErrors: [],
        })
      ).to.be.true;
    });

    it("should handle unexpected errors", async () => {
      const req = {
        query: { tenant: "sti" },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      const validationResultStub = sinon
        .stub(validationResult, "isEmpty")
        .throws(new Error("Some unexpected error"));

      await createDepartment.create(req, res);

      expect(validationResultStub.calledOnce).to.be.true;
      expect(res.status.calledOnceWith(httpStatus.INTERNAL_SERVER_ERROR)).to.be
        .true;
      expect(
        res.json.calledOnceWith({
          success: false,
          message: "Internal Server Error",
          errors: { message: "Some unexpected error" },
        })
      ).to.be.true;
    });
  });
});
