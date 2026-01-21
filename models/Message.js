import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: String,
    receiver: String,
    message: String,
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
