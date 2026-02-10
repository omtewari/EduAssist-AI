import DocumentService from "../services/document.service.js";
import DocumentProcessingService from "../services/documentProcessingService.js"

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const document = await DocumentService.createDocument({
      userId: req.user.id,
      title: req.body.title || req.file.originalname,
      filePath: req.file.path
    });

    return res.status(201).json({
      documentId: document._id,
      status: document.status,
      message: "Document uploaded successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Document upload failed",
      error: error.message
    });
  }
};


//procss document

export const processDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findOne({
      _id: documentId,
      user: req.user.id
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found"
      });
    }

    if (document.status === "processing") {
      return res.status(400).json({
        message: "Document is already being processed"
      });
    }

    await DocumentProcessingService.process(documentId);

    return res.status(200).json({
      documentId,
      status: "processing",
      message: "Document processing started"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to process document",
      error: error.message
    });
  }
};


export const getDocumentStatus = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findOne({
      _id: documentId,
      user: req.user.id
    }).select("status error");

    if (!document) {
      return res.status(404).json({
        message: "Document not found"
      });
    }

    return res.status(200).json({
      documentId,
      status: document.status,
      error: document.error || null
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch document status",
      error: error.message
    });
  }
};