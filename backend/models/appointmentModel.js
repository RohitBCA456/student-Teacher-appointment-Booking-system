import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema(
  {
          studentId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          teacherId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          date: {
            type: Date,
          },
          timeSlot: {
            type: String,
          },
          status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending",
          },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);