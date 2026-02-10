import mongoose from "mongoose";

const documentTextSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      unique: true,
    },

    content: {
      type: String,
      required: true,
    },

    extractionMethod: {
      type: String,
      enum: ["pdf-parse", "ocr"],
      default: "pdf-parse",
    },
  },
  { timestamps: true }
);

export default mongoose.model("DocumentText", documentTextSchema);
