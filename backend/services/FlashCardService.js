import Flashcard from "../models/Flashcard.js";
import FlashcardSet from "../models/FlashcardSet.js";
import Document from "../models/Document.js";
import AIFlashcardService from "./AIFlashcardService.js";

class FlashcardService {
  /**
   * Generate flashcards for a document and save to DB
   */
  async generateForDocument({
    documentId,
    userId,
    count = 10,
  }) {
    const document = await Document.findOne({
      _id: documentId,
      userId,
    });

    if (!document) {
      throw new Error("Document not found.");
    }

    if (document.status !== "completed") {
      throw new Error(
        "Document processing is not completed yet."
      );
    }

    const sourceText =
      document.summaryText ||
      document.extractedText ||
      "";

    if (!sourceText.trim()) {
      throw new Error(
        "No document content available."
      );
    }

    const aiResult =
      await AIFlashcardService.generateFlashcards({
        text: sourceText,
        count,
      });

    const version =
      (await FlashcardSet.countDocuments({
        documentId,
        userId,
      })) + 1;

    const flashcardSet =
      await FlashcardSet.create({
        documentId,
        userId,
        title: `${
          document.originalFileName ||
          "Study Material"
        } Flashcards`,
        modelUsed: aiResult.modelUsed,
        version,
      });

    const flashcardsToInsert =
      aiResult.flashcards.map((card) => ({
        flashcardSetId: flashcardSet._id,
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
      }));

    const savedFlashcards =
      await Flashcard.insertMany(
        flashcardsToInsert
      );

    return {
      flashcardSet,
      totalCards: savedFlashcards.length,
      flashcards: savedFlashcards,
    };
  }

  /**
   * Persist an already-generated AI flashcard result (e.g. from the document processing pipeline).
   * Does not require document.status === "completed".
   */
  async saveGeneratedForDocument({
    documentId,
    userId,
    aiResult,
  }) {
    const document = await Document.findOne({
      _id: documentId,
      userId,
    });

    if (!document) {
      throw new Error("Document not found.");
    }

    if (
      !aiResult?.flashcards ||
      !Array.isArray(aiResult.flashcards) ||
      aiResult.flashcards.length === 0
    ) {
      throw new Error("No flashcards to save.");
    }

    const version =
      (await FlashcardSet.countDocuments({
        documentId,
        userId,
      })) + 1;

    const flashcardSet = await FlashcardSet.create({
      documentId,
      userId,
      title: `${
        document.originalFileName || "Study Material"
      } Flashcards`,
      modelUsed: aiResult.modelUsed || "Rule-Based NLP v2",
      version,
    });

    const flashcardsToInsert = aiResult.flashcards.map(
      (card) => ({
        flashcardSetId: flashcardSet._id,
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
      })
    );

    const savedFlashcards =
      await Flashcard.insertMany(flashcardsToInsert);

    return {
      flashcardSet,
      totalCards: savedFlashcards.length,
      flashcards: savedFlashcards,
    };
  }

  /**
   * Get all flashcard sets of one document
   */
  async getSetsByDocument({
    documentId,
    userId,
  }) {
    return await FlashcardSet.find({
      documentId,
      userId,
    }).sort({ createdAt: -1 });
  }

  /**
   * Get all flashcards inside one set
   */
  async getCardsBySetId({
    flashcardSetId,
    userId,
  }) {
    const set =
      await FlashcardSet.findOne({
        _id: flashcardSetId,
        userId,
      });

    if (!set) {
      throw new Error(
        "Flashcard set not found."
      );
    }

    const cards = await Flashcard.find({
      flashcardSetId,
    }).sort({ createdAt: 1 });

    return {
      flashcardSet: set,
      flashcards: cards,
    };
  }

  /**
   * Delete one flashcard set + cards
   */
  async deleteSet({
    flashcardSetId,
    userId,
  }) {
    const set =
      await FlashcardSet.findOne({
        _id: flashcardSetId,
        userId,
      });

    if (!set) {
      throw new Error(
        "Flashcard set not found."
      );
    }

    await Flashcard.deleteMany({
      flashcardSetId,
    });

    await FlashcardSet.deleteOne({
      _id: flashcardSetId,
    });

    return {
      message:
        "Flashcard set deleted successfully.",
    };
  }
}

export default new FlashcardService();