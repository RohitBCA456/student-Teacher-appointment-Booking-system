import request from "supertest";
import { before, after, afterEach, describe, it } from "node:test";
import assert from "node:assert";
import { connectDB, closeDB, clearDB } from "../../isolatedDB/db.js";
import { app } from "../../app.js";
import { User } from "../../models/userModel.js";
import { Appointment } from "../../models/appointmentModel.js";
import dotenv from "dotenv";
dotenv.config(); 

before(async () => {
  await connectDB();
});

after(async () => {
  await closeDB();
});

afterEach(async () => {
  await clearDB();
});

describe("Students controller integrated testing", () => {
  it("should register user successfully", async () => {
    const res = await request(app).post("/student/registerStudent").send({
      name: "Alice",
      email: "alice@example.com",
      password: "123456",
      department: "Science",
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.message, "Student registered successfully");
  });

  it("should login a user successfully", async () => {
    await User.create({
      name: "Bob",
      email: "bob@example.com",
      password: "123456",
      department: "Math",
      role: "student",
    });

    const res = await request(app)
      .post("/student/loginStudent")
      .send({ email: "bob@example.com", password: "123456" });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.message, "Login successful");
    assert.ok(res.headers["set-cookie"]);
  });
});
