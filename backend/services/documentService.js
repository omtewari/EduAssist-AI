import Document from "../models/Document.js";

class DocumentService {

  // Create new document
  static async createDocument({ userId, title, filePath }) {
    return await Document.create({
      user: userId,
      title,
      filePath,
      status: "uploaded"
    });
  }

  // Get document by ID
  static async getById(documentId) {
    return await Document.findById(documentId);
  }

  // Get document that belongs to specific user
  static async getUserDocument(documentId, userId) {
    return await Document.findOne({
      _id: documentId,
      user: userId
    });
  }

  // Update document status
  static async updateStatus(documentId, status, error = null) {
    return await Document.findByIdAndUpdate(
      documentId,
      { status, error },
      { new: true }
    );
  }

  // Save extracted text
  static async saveExtractedText(documentId, text) {
    return await Document.findByIdAndUpdate(
      documentId,
      { extractedText: text },
      { new: true }
    );
  }

  // Save summary (for next phase)
  static async saveSummary(documentId, summary) {
    return await Document.findByIdAndUpdate(
      documentId,
      { summary },
      { new: true }
    );
  }
}

export default DocumentService;
