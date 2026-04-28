import express from "express";
import FlashcardController from "../controllers/flashcardController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Generate flashcards for a document
 * POST /api/flashcards/generate/:documentId
 */
router.post(
  "/generate/:documentId",
  authMiddleware,
  FlashcardController.generateFlashcards
);

/**
 * Get all flashcard sets of one document
 * GET /api/flashcards/document/:documentId
 */
router.get(
  "/document/:documentId",
  authMiddleware,
  FlashcardController.getSetsByDocument
);

/**
 * Get all flashcards of one set
 * GET /api/flashcards/set/:flashcardSetId
 */
router.get(
  "/set/:flashcardSetId",
  authMiddleware,
  FlashcardController.getCardsBySetId
);

/**
 * Delete one flashcard set
 * DELETE /api/flashcards/set/:flashcardSetId
 */
router.delete(
  "/set/:flashcardSetId",
  authMiddleware,
  FlashcardController.deleteSet
);

export default router;