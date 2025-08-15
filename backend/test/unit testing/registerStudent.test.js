import assert from "node:assert";
import { registerStudent } from "../../controllers/studentController.js";
import { beforeEach, describe, test } from "node:test";
import { User } from "../../models/userModel.js";

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

describe("register Student controller", () => {
  beforeEach(() => {
    User.findOne = async () => null;
    User.create = async () => null;
  });

  test("it should register a student successfully", async () => {
    User.findOne = async () => null;

    User.create = async (data) => ({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      department: data.department,
      subject: data.subject || null,
    });

    const req = {
      body: {
        name: "testUser",
        email: "test@test.com",
        password: "test123",
        role: "student",
        department: "ccsa",
      },
    };

    const res = createRes();

    await registerStudent(req, res);

    assert.strictEqual(res.getStatus(), 201);
    assert.strictEqual(res.getJson().success, true);
    assert.strictEqual(
      res.getJson().message,
      "Student registered successfully"
    );
  });

  test("if user already exist", async () => {
    User.findOne = async () => ({ _id: "existingUser" });

    const req = {
      body: {
        name: "testUser",
        email: "test@test.com",
        password: "test123",
        role: "student",
        department: "ccsa",
      },
    };

    const res = createRes();

    await registerStudent(req, res);

    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(res.getJson().success, false);
    assert.strictEqual(res.getJson().message, "user already exist");
  });

  test("if fields are missing", async () => {
    const req = {
      body: {
        name: " ",
        email: "test@test.com",
        password: "test123",
        role: "student",
        department: "ccsa",
      },
    };

    const res = createRes();

    await registerStudent(req, res);

    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(res.getJson().success, false);
    assert.strictEqual(res.getJson().message, "All fields are required");
  });
});
