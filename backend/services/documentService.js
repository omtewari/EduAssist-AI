import Document from "../models/Document.js";

class DocumentService {
  /**
   * Create new uploaded document
   */
  static async createDocument({
    userId,
    title,
    originalFileName,
    storedFileName,
    fileSize,
    mimeType,
  }) {
    return await Document.create({
      userId,
      title,
      originalFileName,
      storedFileName,
      fileSize,
      mimeType: mimeType || "application/pdf",
      status: "uploaded",
    });
  }

  /**
   * Get document by ID
   */
  static async getById(documentId) {
    return await Document.findById(documentId);
  }

  /**
   * Get document only if owned by user
   */
  static async getUserDocument(documentId, userId) {
    return await Document.findOne({
      _id: documentId,
      userId,
    });
  }

  /**
   * Lightweight read for polling (avoids loading large extractedText/summaryText)
   */
  static async getUserDocumentLean(documentId, userId, projection) {
    return await Document.findOne(
      { _id: documentId, userId },
      projection
    ).lean();
  }

  /**
   * Update processing status
   */
  static async updateStatus(
    documentId,
    status,
    errorMessage = null
  ) {
    return await Document.findByIdAndUpdate(
      documentId,
      {
        status,
        errorMessage,
        lastProcessedAt: new Date(),
      },
      { new: true }
    );
  }

  /**
   * Save extracted text
   */
  static async saveExtractedText(
    documentId,
    extractedText
  ) {
    return await Document.findByIdAndUpdate(
      documentId,
      { extractedText },
      { new: true }
    );
  }

  /**
   * Save AI summary
   */
  static async saveSummary(
    documentId,
    summary
  ) {
    return await Document.findByIdAndUpdate(
      documentId,
      {
        summaryText:
          summary.summaryText || summary,
      },
      { new: true }
    );
  }

  /**
   * Update page count
   */
  static async updatePageCount(
    documentId,
    pageCount
  ) {
    return await Document.findByIdAndUpdate(
      documentId,
      { pageCount },
      { new: true }
    );
  }

  /**
 * Get all documents for a user
 */
static async getUserDocuments(userId) {
  return await Document.find({ userId })
    .sort({ createdAt: -1 });
}
}

export default DocumentService;