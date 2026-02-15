import DocumentService from "./documentService.js";
import extractTextFromPDF from "./TextExtractionService.js";
import AISummaryService from "./AISummaryService.js"; // ✅ NEW
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

      // ===============================
      // 5️⃣ AI SUMMARY (🔥 NEW STEP)
      // ===============================
      const aiSummary =
        await AISummaryService.generateSummary({
          text: extractionResult.text
        });

      // 6️⃣ Save AI summary
      await DocumentService.saveSummary(
        documentId,
        aiSummary
      );

      // 7️⃣ Mark as completed
      await DocumentService.updateStatus(
        documentId,
        "completed"
      );

      return true;

    } catch (error) {
      console.error(
        "[DocumentProcessingService]",
        error.message
      );

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
