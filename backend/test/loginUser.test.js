import assert from "node:assert";
import { describe, test, beforeEach } from "node:test";
import { loginStudent } from "../controllers/studentController.js";
import { User } from "../models/userModel.js";

function createRes() {
  let statusCode = null;
  let jsonData = null;
  let cookie = [];

  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonData = data;
      return this;
    },
    cookie(name, value, options) {
      cookie.push({ name, value, options });
      return this;
    },
    getStatus: () => statusCode,
    getJson: () => jsonData,
    getCookie: () => cookie,
  };
}

describe("login controller", () => {
  beforeEach(() => {
    User.findOne = async () => null;
  });
  test("it should login a user", async () => {
    const fakeUser = {
      role: "student",
      comparePassword: async () => true,
      generateAccessToken: () => "fake-token",
      save: async () => {},
    };

    User.findOne = async () => fakeUser;

    const req = {
      body: {
        email: "test@test.com",
        password: "pass",
      },
    };

    const res = createRes();

    await loginStudent(req, res);

    assert.strictEqual(res.getStatus(), 200);
    assert.strictEqual(res.getJson().message, "Login successful");
    assert.strictEqual(res.getJson().success, true);
    assert.strictEqual(res.getCookie()[0].name, "accessToken");
    assert.strictEqual(res.getCookie()[0].value, "fake-token");
  });

  test("if user not found", async () => {
    User.findOne = async () => null;

    const req = {
      body: {
        email: "test@test.com",
        password: "pass",
      },
    };

    const res = createRes();

    await loginStudent(req, res);

    assert.strictEqual(res.getStatus(), 404);
    assert.strictEqual(res.getJson().success, false);
    assert.strictEqual(res.getJson().message, "Student not found");
  });

  test("if fields are missing", async () => {
    const req = {
      body: {
        email: " ",
        password: "pass",
      },
    };

    const res = createRes();

    await loginStudent(req, res);

    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(res.getJson().success, false);
    assert.strictEqual(res.getJson().message, "All fields are required");
  });
});
