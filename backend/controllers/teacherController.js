import { Appointment } from "../models/appointmentModel.js";
import { User } from "../models/userModel.js";

const registerTeacher = async (req, res) => {
  try {
    const { name, email, password, department, subject } = req.body;
    if (
      [name, email, password, department, subject].some(
        (field) => field.trim() === ""
      )
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
    const teacher = await User.create({
      name,
      email,
      password,
      department,
      subject: subject.toLowerCase(),
      role: "teacher",
    });
    return res.status(201).json({
      success: true,
      message: "Teacher registered successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while registering teacher",
      error: error.message,
    });
  }
};

const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;
    if ([email, password].some((field) => field.trim() === "")) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const teacher = await User.findOne({ email, role: "teacher" });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }
    const isPasswordValid = await teacher.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }
    const accessToken = teacher.generateAccessToken();
    teacher.accessToken = accessToken;
    await teacher.save();
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
      message: "Internal server error while logging in teacher",
      error: error.message,
    });
  }
};

const appointmentController = async (req, res) => {
  try {
    const { appoitmentStatus, studentId, date, time, reschedule = false } = req.body;
    const teacherId = req.user?._id;

    if (!studentId) {
      return res.status(400).json({ message: "Missing student ID." });
    }

    const appointment = await Appointment.findOne({
      studentId,
      teacherId,
      status: { $in: ["pending", "confirmed"] }, // handle both states
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Update fields for confirm or reschedule
    appointment.status = appoitmentStatus ? "confirmed" : "rejected";
    if (date) appointment.date = date;
    if (time) appointment.timeSlot = time;

    await appointment.save();

    const action = reschedule ? "Rescheduled" : (appoitmentStatus ? "Confirmed" : "Rejected");

    return res.status(200).json({
      success: true,
      message: `Appointment ${action} successfully.`,
      appointment,
    });

  } catch (error) {
    console.error("Error in appointmentController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating appointment.",
      error: error.message,
    });
  }
};


const logoutTeacher = async (req, res) => {
  try {
    const teacherId = req.user?._id;
    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No teacher logged in",
      });
    }
    await User.findByIdAndUpdate(teacherId, { $unset: { accessToken: "" } });
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
      message: "Internal server error while logging out teacher",
      error: error.message,
    });
  }
};

export { registerTeacher, loginTeacher, appointmentController, logoutTeacher };
