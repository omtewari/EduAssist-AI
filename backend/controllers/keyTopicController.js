import KeyTopic from "../models/KeyTopic.js";
import DocumentService from "../services/documentService.js";
import AIKeyTopicService from "../services/AIKeyTopicService.js";

class KeyTopicController {
  /**
   * Start background topic extraction (heavy). Use GET after a short delay.
   */
  static async generateForDocument(req, res) {
    try {
      const { documentId } = req.params;
      const userId = req.user.id;

      const document = await DocumentService.getUserDocumentLean(
        documentId,
        userId,
        { extractedText: 1 }
      );

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      if (!document.extractedText || !document.extractedText.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Document has no extracted text. Process the document first.",
        });
      }

      const text = document.extractedText;

      setImmediate(() => {
        AIKeyTopicService.generateTopics({
          text,
          documentId,
          userId,
          count: 10,
        }).catch((err) =>
          console.error("[AIKeyTopicService]", err?.message || err)
        );
      });

      return res.status(202).json({
        success: true,
        documentId,
        message: "Key topic generation started",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getByDocument(
    req,
    res
  ) {
    try {
      const { documentId } =
        req.params;

      const userId = req.user.id;

      const [topics, documentExists] =
        await Promise.all([
          KeyTopic.find({
            documentId,
            userId,
          }).sort({
            confidenceScore: -1,
          }),
          DocumentService.getUserDocumentLean(
            documentId,
            userId,
            { _id: 1 }
          ),
        ]);

      if (!documentExists) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      return res.status(200).json({
        success: true,
        count: topics.length,
        data: topics,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }

  static async getByUser(
    req,
    res
  ) {
    try {
      const userId = req.user.id;

      const topics =
        await KeyTopic.find({
          userId,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        count: topics.length,
        data: topics,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }

  static async deleteByDocument(
    req,
    res
  ) {
    try {
      const { documentId } =
        req.params;
      const userId = req.user.id;

      await KeyTopic.deleteMany({
        documentId,
        userId,
      });

      return res.status(200).json({
        success: true,
        message:
          "Topics deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
}

export default KeyTopicController;