import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    originalFileName: {
      type: String,
      required: true,
    },

    storedFileName: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number, // bytes
      required: true,
    },

    pageCount: {
      type: Number,
    },

    mimeType: {
      type: String,
      default: "application/pdf",
    },

    status: {
      type: String,
      enum: ["uploaded", "processing", "completed", "failed"],
      default: "uploaded",
    },

    errorMessage: {
      type: String,
    },

    lastProcessedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
