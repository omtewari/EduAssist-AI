import mongoose from "mongoose";

const summarySchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    summaryText: {
      type: String,
      required: true,
    },

     bulletPoints: {
      type: [String],
      default: [],
    },
    
    summaryType: {
      type: String,
      enum: ["short", "detailed", "bullet"],
      default: "short",
    },

    modelUsed: {
      type: String,
    },

    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Summary", summarySchema);
