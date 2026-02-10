import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    flashcardSetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FlashcardSet",
      required: true,
      index: true,
    },

    question: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Flashcard", flashcardSchema);
