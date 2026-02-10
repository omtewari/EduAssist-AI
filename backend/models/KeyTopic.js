import mongoose from "mongoose";

const keyTopicSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model("KeyTopic", keyTopicSchema);
