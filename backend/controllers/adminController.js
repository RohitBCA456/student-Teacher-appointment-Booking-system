import { User } from "../models/userModel.js";

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = admin.generateAccessToken();
    admin.accessToken = token;
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    };
    return res.status(200).cookie("accessToken", token, options).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while logging in admin",
      error: error.message,
    });
  }
};

const addTeacher = async (req, res) => {
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

    const existingTeacher = await User.findOne({ email, role: "teacher" });
    if (existingTeacher) {
      return res.status(409).json({
        success: false,
        message: "Teacher with this email already exists",
      });
    }

    const newTeacher = await User.create({
      name,
      email,
      password,
      role: "teacher",
      department,
      subject,
    });

    return res.status(201).json({
      success: true,
      message: "Teacher added successfully",
      teacher: newTeacher,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding teacher",
      error: error.message,
    });
  }
};

const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select(
      "-password -accessToken"
    );
    return res.status(200).json({
      success: true,
      message: "Teachers retrieved successfully",
      teachers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while retrieving teachers",
      error: error.message,
    });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "-password -accessToken"
    );
    return res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while retrieving students",
      error: error.message,
    });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
    }

    const teacher = await User.findByIdAndDelete(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting teacher",
      error: error.message,
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const student = await User.findByIdAndDelete(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting student",
      error: error.message,
    });
  }
};

const addStudent = async (req, res) => {
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

    const existingStudent = await User.findOne({ email, role: "student" });
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Student with this email already exists",
      });
    }

    const newStudent = await User.create({
      name,
      email,
      password,
      role: "student",
      department,
    });

    return res.status(201).json({
      success: true,
      message: "Student added successfully",
      student: newStudent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding student",
      error: error.message,
    });
  }
};

const logoutAdmin = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ID is required for logout",
      });
    }

    const admin = await User.findOne({ _id: userId, role: "admin" });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    admin.accessToken = null;
    await admin.save();
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
      message: "Internal server error while logging out admin",
      error: error.message,
    });
  }
};

const editTeacherDetails = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { name, email, department, subject } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
    }

    const teacher = await User.findOne({ _id: teacherId, role: "teacher" });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Update allowed fields
    if (name) teacher.name = name;
    if (email) teacher.email = email;
    if (department) teacher.department = department;
    if (subject) teacher.subject = subject;

    await teacher.save();

    return res.status(200).json({
      success: true,
      message: "Teacher details updated successfully",
      teacher,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating teacher",
      error: error.message,
    });
  }
};


export {
  loginAdmin,
  addTeacher,
  getAllTeachers,
  getAllStudents,
  deleteTeacher,
  deleteStudent,
  addStudent,
  logoutAdmin,
  editTeacherDetails,
};
