import DocumentService from "../services/documentService.js";
import DocumentProcessingService from "../services/documentProcessingService.js";

/**
 * Upload Document
 * Creates document entry only (no processing yet)
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
      filePath: req.file.path,
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

/**
 * Start Document Processing
 * Triggers extraction + future AI summary
 */
export const processDocument = async (req, res) => {
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

    if (document.status === "processing") {
      return res.status(400).json({
        success: false,
        message: "Document is already being processed",
      });
    }

    // Trigger processing (async logic inside service)
    await DocumentProcessingService.process(documentId);

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
      documentId,
      status: document.status,
      error: document.error || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch document status",
      error: error.message,
    });
  }
};
