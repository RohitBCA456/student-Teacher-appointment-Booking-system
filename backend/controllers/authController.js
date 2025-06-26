import { User } from "../models/userModel.js";

const CurrentUserRole = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "No user found with this email.",
    });
  }
  const role = user.role;
  return res.status(200).json({
    success: true,
    message: "Fetched role of current user.",
    role,
  });
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. No user ID found in token.",
      });
    }

    const user = await User.findById(userId).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully.",
      user,
    });
  } catch (err) {
    console.error("Error in getCurrentUser:", err);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

export { CurrentUserRole, getCurrentUser };
