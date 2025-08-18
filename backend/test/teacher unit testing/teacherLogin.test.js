import assert from "node:assert";
import { describe, test, beforeEach } from "node:test";
import { User } from "../../models/userModel.js";
import { loginTeacher } from "../../controllers/teacherController.js";

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

describe("Teacher login controller", () => {
  beforeEach(() => {
    User.findOne = async () => null;
  });
  test("it should login a user", async () => {
    const fakeUser = {
      role: "teacher",
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

    await loginTeacher(req, res);

    assert.strictEqual(res.getStatus(), 200);
    assert.strictEqual(res.getJson().message, "Login successful");
    assert.strictEqual(res.getJson().success, true);
    assert.strictEqual(res.getCookie()[0].name, "accessToken");
    assert.strictEqual(res.getCookie()[0].value, "fake-token");
  });

  test("it should fail if fields are missing", async () => {
    const req = {
      body: {
        email: " ",
        password: "123",
      },
    };

    const res = createRes();

    await loginTeacher(req, res);

    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(res.getJson().success, false);
    assert.strictEqual(res.getJson().message, "All fields are required");
  });

  test("if user not found", async () => {
    User.findOne = async () => null;

    const req = {
      body: {
        email: "test@test.com",
        password: "1234",
      },
    };

    const res = createRes();

    await loginTeacher(req, res);

    assert.strictEqual(res.getStatus(), 404);
    assert.strictEqual(res.getJson().success, false);
    assert.strictEqual(res.getJson().message, "Teacher not found");
  });
});
