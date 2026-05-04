import DocumentService from "./documentService.js";
import extractTextFromPDF from "./TextExtractionService.js";
import AISummaryService from "./AISummaryService.js";
import AIFlashcardService from "./AIFlashcardService.js";
import AIKeyTopicService from "./AIKeyTopicService.js";
import path from "path";

class DocumentProcessingService {
  static async process(documentId) {
    const processStartedAt = Date.now();
    try {
      const document = await DocumentService.getById(documentId);

      if (!document) {
        throw new Error("Document not found");
      }

      await DocumentService.updateStatus(
        documentId,
        "processing"
      );

      const filePath = path.resolve(
        process.cwd(),
        "uploads/documents",
        document.storedFileName
      );

      const extractionStartedAt = Date.now();
      const extractionResult =
        await extractTextFromPDF(filePath);
      this.logDuration(
        documentId,
        "extract_text",
        extractionStartedAt
      );

      if (!extractionResult.success) {
        await DocumentService.updateStatus(
          documentId,
          "failed",
          extractionResult.error
        );
        return false;
      }

      const text = extractionResult.text;

      const saveTextStartedAt = Date.now();
      await DocumentService.saveExtractedText(
        documentId,
        text
      );
      this.logDuration(
        documentId,
        "save_extracted_text",
        saveTextStartedAt
      );

      // Run AI tasks in parallel to reduce total processing time.
      const aiTasksStartedAt = Date.now();
      const [
        summaryResult,
        flashcardsResult,
        keyTopicsResult
      ] = await Promise.allSettled([
        AISummaryService.generateSummary({ text }),
        AIFlashcardService.generateFlashcards({
          text,
          documentId,
          userId: document.userId,
          count: 10
        }),
        AIKeyTopicService.generateTopics({
          text,
          documentId,
          userId: document.userId,
          count: 10
        })
      ]);
      this.logDuration(
        documentId,
        "ai_parallel_tasks",
        aiTasksStartedAt
      );

      if (summaryResult.status === "rejected") {
        throw summaryResult.reason;
      }
      if (flashcardsResult.status === "rejected") {
        throw flashcardsResult.reason;
      }
      if (keyTopicsResult.status === "rejected") {
        throw keyTopicsResult.reason;
      }

      const saveSummaryStartedAt = Date.now();
      await DocumentService.saveSummary(
        documentId,
        summaryResult.value
      );
      this.logDuration(
        documentId,
        "save_summary",
        saveSummaryStartedAt
      );

      await DocumentService.updateStatus(
        documentId,
        "completed"
      );

      this.logDuration(
        documentId,
        "total_processing",
        processStartedAt
      );

      return true;

    } catch (error) {
      const message =
        DocumentProcessingService.formatError(error);

      console.error(
        "[DocumentProcessingService]",
        message
      );

      try {
        await DocumentService.updateStatus(
          documentId,
          "failed",
          message.slice(0, 280)
        );
      } catch (dbErr) {
        console.error(
          "[DocumentProcessingService] could not save failed status:",
          dbErr?.message || dbErr
        );
      }

      return false;
    }
  }

  static formatError(error) {
    if (error instanceof Error) {
      const base =
        error.message?.trim()
          ? error.message
          : String(error);

      return base.replace(/\s+/g, " ").trim();
    }

    if (typeof error === "string") {
      return error.replace(/\s+/g, " ").trim();
    }

    return String(error).replace(/\s+/g, " ").trim()
      || "Document processing failed.";
  }

  static logDuration(documentId, stage, startedAt) {
    const durationMs = Date.now() - startedAt;
    console.log(
      `[DocumentProcessingService][${documentId}] ${stage} took ${durationMs}ms`
    );
  }
}

export default DocumentProcessingService;