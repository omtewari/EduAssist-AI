import express from "express";
import {
     uploadDocument,
     processDocument,
     getDocumentStatus
 } from "../controllers/documentController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadDocument
);

router.post(
  "/:documentId/process",
  authMiddleware,
  processDocument
);

router.get(
  "/:documentId/status",
  authMiddleware,
  getDocumentStatus
);

export default router;
