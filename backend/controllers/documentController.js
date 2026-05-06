import DocumentService from "../services/documentService.js";
import DocumentProcessingService from "../services/documentProcessingService.js";
import fs from "fs/promises";
import path from "path";

/**
 * Upload Document
 */
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const document = await DocumentService.createDocument({
      userId: req.user.id,
      title: req.body.title || req.file.originalname,
      originalFileName: req.file.originalname,
      storedFileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    return res.status(201).json({
      success: true,
      documentId: document._id,
      status: document.status,
      message: "Document uploaded successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Document upload failed",
      error: error.message,
    });
  }
};

export const getUserDocuments = async (req, res) => {
  try {
    const userId = req.user?.id || "temp-user";

    const documents = await DocumentService.getUserDocuments(userId);

    return res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("GET DOCUMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
    });
  }
};

/**
 * Start Document Processing
 */
export const processDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const staleProcessingMs =
      Number(process.env.DOCUMENT_PROCESS_STALE_MS) || 45 * 60 * 1000;

    const document = await DocumentService.getUserDocumentLean(
      documentId,
      req.user.id,
      { status: 1, lastProcessedAt: 1, updatedAt: 1 }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (document.status === "processing") {
      const refTime =
        document.lastProcessedAt || document.updatedAt;
      const refMs =
        refTime instanceof Date
          ? refTime.getTime()
          : refTime
            ? new Date(refTime).getTime()
            : 0;
      const ageMs = refMs ? Date.now() - refMs : Infinity;

      if (ageMs < staleProcessingMs) {
        return res.status(400).json({
          success: false,
          message: "Document is already being processed",
        });
      }

      console.warn(
        `[processDocument] restarting stale processing for ${documentId} (age=${ageMs}ms)`
      );
    }

    // Defer heavy work so POST /process returns immediately and polls stay responsive
    setImmediate(() => {
      DocumentProcessingService.process(documentId).catch((err) =>
        console.error("[DocumentProcessingService]", err?.message || err)
      );
    });

    return res.status(200).json({
      success: true,
      documentId,
      status: "processing",
      message: "Document processing started",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process document",
      error: error.message,
    });
  }
};

/**
 * Get Document Status
 */
export const getDocumentStatus = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await DocumentService.getUserDocumentLean(
      documentId,
      req.user.id,
      { status: 1, errorMessage: 1 }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      documentId,
      status: document.status,
      error: document.errorMessage || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch document status",
      error: error.message,
    });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await DocumentService.getUserDocument(
      documentId,
      req.user.id
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("GET DOCUMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching document",
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const deletedDocument = await DocumentService.deleteUserDocument(
      documentId,
      userId
    );

    if (!deletedDocument) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const filePath = path.resolve(
      process.cwd(),
      "uploads/documents",
      deletedDocument.storedFileName
    );

    try {
      await fs.unlink(filePath);
    } catch (fileError) {
      if (fileError?.code !== "ENOENT") {
        console.warn(
          `[deleteDocument] could not delete file ${deletedDocument.storedFileName}:`,
          fileError?.message || fileError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete document",
      error: error.message,
    });
  }
};