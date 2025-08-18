import assert from "node:assert";
import { describe, test, beforeEach } from "node:test";
import {
  loginStudent,
  logoutStudent,
} from "../../controllers/studentController.js";
import { User } from "../../models/userModel.js";

function createRes() {
  let statusCode = null;
  let jsonData = null;
  let clearCookies = [];

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
      clearCookies.push({ name, options });
      return this;
    },
    getStatus: () => statusCode,
    getJson: () => jsonData,
    getClearedCookies: () => clearCookies,
  };
}

describe("logout controller", () => {
  test("it should logout a user", async () => {
    let updatedUserId = null;

    User.findByIdAndUpdate = async (id) => {
      updatedUserId = id;

      return {};
    };

    const req = {
      user: { _id: "user123" },
    };

    const res = createRes();

    await logoutStudent(req, res);

    assert.strictEqual(res.getStatus(), 200);
    assert.strictEqual(res.getJson().message, "Logout successful");
    assert.strictEqual(res.getClearedCookies()[0].name, "accessToken");
  });

  test("if userId is missing", async () => {
    const req = {
      user: null,
    };

    const res = createRes();

    await logoutStudent(req, res);

    assert.strictEqual(res.getStatus(), 401);
    assert.strictEqual(
      res.getJson().message,
      "Unauthorized: User not logged in"
    );
    assert.strictEqual(res.getJson().success, false);
  });
});
