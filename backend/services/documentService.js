import Document from "../models/Document.js";

class DocumentService {
  static async createDocument({ userId, title, filePath }) {
    return await Document.create({
      user: userId,
      title,
      filePath,
      status: "uploaded"
    });
  }

  static async updateStatus(documentId, status, error = null) {
    return await Document.findByIdAndUpdate(
      documentId,
      { status, error },
      { new: true }
    );
  }
}

export default DocumentService;
