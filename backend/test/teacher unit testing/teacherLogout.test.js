import assert from "node:assert";
import { describe, test, beforeEach } from "node:test";
import { User } from "../../models/userModel.js";
import { logoutTeacher } from "../../controllers/teacherController.js";

function createRes() {
  let statusCode = null;
  let jsonData = null;
  let clearCookie = [];

  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonData = data;
      return this;
    },
    clearCookie(name, options) {
      clearCookie.push({ name, options });
      return this;
    },
    getStatus: () => statusCode,
    getJson: () => jsonData,
    getClearCookie: () => clearCookie,
  };
}

describe("Teacher logout controller", () => {
  beforeEach(() => {
    User.findByIdAndUpdate = async () => null;
  });
  test("it should logout a teacher", async () => {
    let updatedUserId = null;

    User.findByIdAndUpdate = async (id) => {
      updatedUserId = id;
      return {};
    };

    const req = {
      user: { _id: "1234" },
    };

    const res = createRes();

    await logoutTeacher(req, res);

    assert.strictEqual(res.getStatus(), 200);
    assert.strictEqual(res.getJson().success, true);
    assert.strictEqual(res.getJson().message, "Logout successful");
    assert.strictEqual(updatedUserId, "1234");
    assert.strictEqual(res.getClearCookie()[0].name, "accessToken");
  });

  test("if the credentials are missing", async () => {
    const req = {
      user: null,
    };

    const res = createRes();

    await logoutTeacher(req, res);

    assert.strictEqual(res.getStatus(), 401);
    assert.strictEqual(res.getJson().success, false);
    assert.strictEqual(
      res.getJson().message,
      "Unauthorized: No teacher logged in"
    );
  });
});
