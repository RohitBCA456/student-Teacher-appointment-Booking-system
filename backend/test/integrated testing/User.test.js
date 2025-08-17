// Import necessary modules
import request from "supertest"; // A library for making HTTP requests in tests (like a fake browser)
import { before, after, afterEach, describe, it } from "node:test"; // The built-in Node.js test runner functions
import assert from "node:assert"; // The built-in Node.js assertion library for checking test outcomes
import { connectDB, closeDB, clearDB } from "../../isolatedDB/db.js"; // Helper functions to manage the test database
import { app } from "../../app.js"; // The main Express application instance
import { User } from "../../models/userModel.js"; // The User model for interacting with the users collection
import dotenv from "dotenv"; // Module to load environment variables from a .env file

// Load environment variables from the .env file
dotenv.config();

// --- Test Hooks ---
// These functions run at specific times to set up and tear down the test environment.

// `before` hook: Runs once before any of the tests in this file start.
before(async () => {
  // Connect to the isolated in-memory test database.
  await connectDB();
});

// `after` hook: Runs once after all the tests in this file have finished.
after(async () => {
  // Disconnect from the test database to clean up resources.
  await closeDB();
});

// `afterEach` hook: Runs after each individual test (`it` block) completes.
afterEach(async () => {
  // Clear all data from the database to ensure each test runs in isolation.
  await clearDB();
});

// --- Test Suite ---
// A `describe` block groups related tests together. This suite is for the "Students controller".
describe("Students controller integrated testing", () => {
  // --- Test Case 1: User Registration ---
  it("should register user successfully", async () => {
    // Action: Send a POST request to the registration endpoint with new user data.
    const res = await request(app).post("/student/registerStudent").send({
      name: "Alice",
      email: "alice@example.com",
      password: "123456",
      department: "Science",
    });

    // Assertions: Check if the server's response is correct.
    assert.strictEqual(res.status, 201, "Expected status code to be 201 (Created)");
    assert.strictEqual(res.body.success, true, "Expected success to be true");
    assert.strictEqual(
      res.body.message,
      "Student registered successfully",
      "Expected a success message"
    );
  });

  // --- Test Case 2: User Login ---
  it("should login a user successfully", async () => {
    // Setup: First, create a user directly in the database to test against.
    await User.create({
      name: "Bob",
      email: "bob@example.com",
      password: "123456",
      department: "Math",
      role: "student",
    });

    // Action: Send a POST request to the login endpoint with the user's credentials.
    const res = await request(app)
      .post("/student/loginStudent")
      .send({ email: "bob@example.com", password: "123456" });

    // Assertions: Check for a successful response and that a cookie was set.
    assert.strictEqual(res.status, 200, "Expected status code to be 200 (OK)");
    assert.strictEqual(res.body.success, true, "Expected success to be true");
    assert.strictEqual(res.body.message, "Login successful", "Expected a success message");
    assert.ok(res.headers["set-cookie"], "Expected the 'set-cookie' header to be present");
  });

  // --- Test Case 3: User Logout ---
  it("Logout student successfully", async () => {
    // Setup: Create a user in the database.
    await User.create({
      name: "John",
      email: "john@example.com",
      password: "123456",
      department: "Biology",
      role: "student",
    });

    // Action 1: Log the user in to get an authentication cookie.
    const loginRes = await request(app)
      .post("/student/loginStudent")
      .send({ email: "john@example.com", password: "123456" });

    // Pre-condition check: Make sure the login was successful and we got a cookie.
    const cookie = loginRes.headers["set-cookie"];
    assert.ok(cookie, "Login should return a cookie");

    // Action 2: Send a POST request to the logout endpoint, passing the cookie for authentication.
    const res = await request(app)
      .post("/student/logoutStudent")
      .set("Cookie", cookie); // Set the cookie in the request header.

    // Assertions: Check for a successful logout response and that the cookie was cleared.
    assert.strictEqual(res.status, 200, "Expected status code to be 200 (OK)");
    assert.strictEqual(res.body.success, true, "Expected success to be true");
    assert.strictEqual(res.body.message, "Logout successful", "Expected a success message");

    // Check that the server sent instructions to clear the cookie.
    const clearedCookie = res.headers["set-cookie"][0];
    assert.ok(
      clearedCookie.includes("accessToken=;"),
      "Logout should clear the cookie by setting its value to empty"
    );
  });

  // --- Test Case 4: Teacher Search ---
  it("should search a teacher", async () => {
    // Setup 1: Create a student who will perform the search.
    await User.create({
      name: "John",
      email: "john@example.com",
      password: "123456",
      department: "Biology",
      role: "student",
    });

    // Setup 2: Create a teacher to be found in the search.
    await User.create({
      name: "Amit Rai",
      email: "Amit@test.com",
      password: "123456",
      department: "CCSA",
      role: "teacher",
      subject: "java",
    });

    // Action 1: Log the student in to get an authentication cookie.
    const loginRes = await request(app)
      .post("/student/loginStudent")
      .send({ email: "john@example.com", password: "123456" });

    // Pre-condition check: Ensure login was successful and a cookie was received.
    const cookie = loginRes.headers["set-cookie"];
    assert.ok(cookie, "Login should return a cookie");

    // Action 2: Send a POST request to the search endpoint with the cookie and search query.
    const searchTeacherRes = await request(app)
      .post("/student/searchTeacher")
      .set("Cookie", cookie) // This authenticates the request, proving who is searching.
      .send({ subject: "java" });

    // Assertions: Verify the search was successful and returned the correct teacher.
    assert.strictEqual(searchTeacherRes.status, 200, "Expected status code to be 200 (OK)");
    assert.strictEqual(searchTeacherRes.body.success, true, "Expected success to be true");
    assert.strictEqual(searchTeacherRes.body.message, "Teachers found", "Expected a success message");
    assert.strictEqual(
      searchTeacherRes.body.data[0].name,
      "Amit Rai",
      "Expected to find the correct teacher"
    );
  });
});
