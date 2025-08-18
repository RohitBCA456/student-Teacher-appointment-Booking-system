import assert from "node:assert";
import { describe, test, afterEach } from "node:test";
import { User } from "../../models/userModel.js";
import { Appointment } from "../../models/appointmentModel.js";
import { searchTeacher } from "../../controllers/studentController.js";

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

describe("search controller", () => {
  afterEach(() => {
    // Reset mocks after each test
    User.find = () => ({
      select: async () => [],
    });
    Appointment.find = async () => [];
  });

  test("if the field is missing", async () => {
    const req = {
      body: {
        subject: " ",
      },
    };

    const res = createRes();

    await searchTeacher(req, res);

    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(res.getJson().success, false);
    assert.strictEqual(res.getJson().message, "Subject is required");
  });

  test("if no teacher found", async () => {
    // Simulate no teachers found for that subject
    User.find = () => ({
      select: async () => [],
    });

    const req = {
      body: {
        subject: "Mathematics",
      },
      user: { _id: "64a6c9f9c1234567890abcd1" }, // fake ObjectId string
    };

    const res = createRes();

    await searchTeacher(req, res);

    assert.strictEqual(res.getStatus(), 404);
    assert.strictEqual(res.getJson().success, false);
    assert.strictEqual(
      res.getJson().message,
      "No teachers found for the specified subject"
    );
  });

  test("successfully founds a teacher", async () => {
    User.find = () => ({
      select: async () => [
        { _id: "t1", name: "John Doe", subject: "Mathematics" },
      ],
    });

    Appointment.find = async () => [];

    const req = {
      body: {
        subject: "Mathematics",
      },
      user: { _id: "64a6c9f9c1234567890abcd1" }, // fake ObjectId string
    };

    const res = createRes();

    await searchTeacher(req, res);

    assert.strictEqual(res.getStatus(), 200);
    assert.strictEqual(res.getJson().success, true);
    assert.strictEqual(res.getJson().message, "Teachers found");
  });
});
