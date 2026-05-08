import FlashcardService from "../services/FlashCardService.js";

class FlashcardController {
  /**
   * POST /api/flashcards/generate/:documentId
   */
  async generateFlashcards(req, res) {
    try {
      const { documentId } = req.params;
      const { count } = req.body;
      const userId = req.user.id;

      const result = await FlashcardService.generateForDocument({
        documentId,
        userId,
        count: count || 10,
      });

      return res.status(201).json({
        success: true,
        message: "Flashcards generated successfully.",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/flashcards/document/:documentId
   */
  async getSetsByDocument(req, res) {
    try {
      const { documentId } = req.params;
      const userId = req.user.id;

      const sets = await FlashcardService.getSetsByDocument({
        documentId,
        userId,
      });

      return res.status(200).json({
        success: true,
        data: sets,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/flashcards/set/:flashcardSetId
   */
  async getCardsBySetId(req, res) {
    try {
      const { flashcardSetId } = req.params;
      const userId = req.user.id;

      const result = await FlashcardService.getCardsBySetId({
        flashcardSetId,
        userId,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * DELETE /api/flashcards/set/:flashcardSetId
   */
  async deleteSet(req, res) {
    try {
      const { flashcardSetId } = req.params;
      const userId = req.user.id;

      const result = await FlashcardService.deleteSet({
        flashcardSetId,
        userId,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new FlashcardController();