import DocumentService from "./documentService.js";
import extractTextFromPDF from "./TextExtractionService.js";
import path from "path";

class DocumentProcessingService {
  static async process(documentId) {
    try {
      // 1️⃣ Get document
      const document = await DocumentService.getById(documentId);

      if (!document) {
        throw new Error("Document not found");
      }

      // 2️⃣ Mark as processing
      await DocumentService.updateStatus(documentId, "processing");

      // 3️⃣ Extract text from file
      const filePath = path.resolve(document.filePath);

      const extractionResult = await extractTextFromPDF(filePath);

      if (!extractionResult.success) {
        await DocumentService.updateStatus(
          documentId,
          "failed",
          extractionResult.error
        );
        return false;
      }

      // 4️⃣ Save extracted text
      await DocumentService.saveExtractedText(
        documentId,
        extractionResult.text
      );

      /**
       * 🚧 STOP HERE FOR NOW
       * Next step: AI Summary
       *
       * We keep status = "processing"
       * until AI layer completes
       */

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
