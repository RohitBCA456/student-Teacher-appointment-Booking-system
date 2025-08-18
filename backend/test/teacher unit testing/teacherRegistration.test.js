import assert from "node:assert";
import { describe, test, beforeEach } from "node:test";
import { User } from "../../models/userModel.js";
import { registerTeacher } from "../../controllers/teacherController.js";

function createRes() {
  let statusCode = null;
  let jsonData = null;

  return {
    status(code) {
      statusCode = code;
      return this;
    },

    json(data) {
      jsonData = data;
      return this;
    },

    getStatus: () => statusCode,
    getJson: () => jsonData,
  };
}

describe("Teacher registration controller", () => {
  beforeEach(() => {
    User.findOne = async () => null;
    User.create = async () => null;
  });

  test("it should register a user successfully", async () => {
    User.findOne = async () => null;

    User.create = async (data) => ({
      name: data.name,
      email: data.email,
      password: data.password,
      department: data.department,
      subject: data.subject,
    });

    const req = {
      body: {
        name: "testUser",
        email: "user@test.com",
        password: "test1234",
        department: "Test",
        subject: "JAVA",
      },
    };

    const res = createRes();

    await registerTeacher(req, res);

    assert.strictEqual(res.getStatus(), 201);
    assert.strictEqual(res.getJson().success, true);
    assert.strictEqual(
      res.getJson().message,
      "Teacher registered successfully"
    );
  });

  test("if some field is missing", async () => {
    const req = {
      body: {
        name: " ",
        email: "user@test.com",
        password: "test1234",
        department: "Test",
        subject: "JAVA",
      },
    };

    const res = createRes();

    await registerTeacher(req, res);

    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(res.getJson().success, false);
    assert.strictEqual(res.getJson().message, "All fields are required");
  });

  test("if user already exist", async () => {
    User.findOne = async () => "existingUser";

    const req = {
      body: {
        name: "testUser",
        email: "user@test.com",
        password: "test1234",
        department: "Test",
        subject: "JAVA",
      },
    };

    const res = createRes();

    await registerTeacher(req, res);

    assert.strictEqual(res.getStatus(), 401);
    assert.strictEqual(res.getJson().success, false);
    assert.strictEqual(
      res.getJson().message,
      "User with this email already exists."
    );
  });
});
