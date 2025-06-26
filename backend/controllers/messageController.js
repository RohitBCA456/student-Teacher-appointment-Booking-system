import mongoose from "mongoose";
import { Message } from "../models/messageModel.js";
import { User } from "../models/userModel.js";

const getStudentMessages = async (req, res) => {
  try {
    const teacherId = req.user._id;
    console.log("Fetching messages for teacher ID:", teacherId);

    const messages = await Message.find({
      roomId: { $regex: teacherId.toString() },
    });

    console.log("Messages found:", messages);

    const studentIdStrings = [
      ...new Set(
        messages
          .map((msg) => msg.roomId.split("-"))
          .flat()
          .filter((id) => id !== teacherId.toString())
      ),
    ];

    console.log("Extracted studentId strings:", studentIdStrings);

    const studentObjectIds = studentIdStrings.map((id) =>
      new mongoose.Types.ObjectId(id)
    );

    const students = await User.find({
      _id: { $in: studentObjectIds },
      role: "student",
    }).select("name email");

    console.log("Students found:", students);

    res.status(200).json({ students });
  } catch (err) {
    console.error("Error fetching chat students:", err);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { studentId, teacherId } = req.body;

    const roomId1 = `${teacherId}-${studentId}`;
    const roomId2 = `${studentId}-${teacherId}`;

    const result = await Message.updateMany(
      {
        roomId: { $in: [roomId1, roomId2] },
        read: false,
      },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "Messages marked as read", modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("Error marking messages as read:", err);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
};

export { getStudentMessages, markAsRead };
