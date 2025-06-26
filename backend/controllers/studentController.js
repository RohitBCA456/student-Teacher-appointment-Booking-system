import { Appointment } from "../models/appointmentModel.js";
import { User } from "../models/userModel.js";

const registerStudent = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;
    if (
      [name, email, password, department].some((field) => field.trim() === "")
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (!email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }
    const student = await User.create({
      name,
      email,
      password,
      department,
      role: "student",
    });
    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while registering student",
      error: error.message,
    });
  }
};

const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    if ([email, password].some((field) => field.trim() === "")) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const student = await User.findOne({ email, role: "student" });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    const isPasswordValid = await student.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }
    const accessToken = student.generateAccessToken();
    student.accessToken = accessToken;
    await student.save({ validateBeforeSave: false });
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    };
    return res.status(200).cookie("accessToken", accessToken, options).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while logging in",
      error: error.message,
    });
  }
};

import mongoose from "mongoose";

const searchTeacher = async (req, res) => {
  try {
    const { subject } = req.body;

    if (!subject || subject.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Subject is required",
      });
    }

    // Step 1: Find all teachers with the subject
    const allTeachers = await User.find({
      role: "teacher",
      subject: { $in: [subject] },
    }).select("-password -accessToken");

    if (allTeachers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No teachers found for the specified subject",
      });
    }

    const teacherIds = allTeachers.map((t) => t._id);

    // Step 2: Find student's appointments to those teachers
    const appointments = await Appointment.find({
      studentId: new mongoose.Types.ObjectId(req.user._id),
      teacherId: { $in: teacherIds },
      status: { $in: ["pending", "confirmed"] }, // CASE SENSITIVE
    });

    // Step 3: Convert to string and store in Set
    const excludedTeacherIds = new Set(
      appointments.map((a) => String(a.teacherId)) // force to string
    );

    // Step 4: Filter out already-requested/approved teachers
    const availableTeachers = allTeachers.filter(
      (teacher) => !excludedTeacherIds.has(String(teacher._id)) // compare as string
    );

    // Step 5: Respond
    if (availableTeachers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No available teachers (already requested or confirmed)",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Teachers found",
      data: availableTeachers,
    });
  } catch (error) {
    console.error("searchTeacher error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while searching for teachers",
      error: error.message,
    });
  }
};

const logoutStudent = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not logged in",
      });
    }
    await User.findByIdAndUpdate(studentId, { $unset: { accessToken: "" } });
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    };
    return res.status(200).clearCookie("accessToken", options).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while logging out",
      error: error.message,
    });
  }
};

export { registerStudent, loginStudent, searchTeacher, logoutStudent };
