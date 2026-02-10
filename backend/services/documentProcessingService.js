import DocumentService from "./documentService.js";

class DocumentProcessingService {
  static async process(documentId) {
    try {
      // Step 1: mark as processing
      await DocumentService.updateStatus(documentId, "processing");

      // 🚧 NEXT STEPS (coming soon)
      // - extract text
      // - save DocumentText
      // - run AI services
      // - save Summary / KeyTopics / Flashcards

      // TEMP: directly mark completed
      await DocumentService.updateStatus(documentId, "completed");

      return true;
    } catch (error) {
      await DocumentService.updateStatus(
        documentId,
        "failed",
        error.message
      );
      throw error;
    }
  }
}

export default DocumentProcessingService;
