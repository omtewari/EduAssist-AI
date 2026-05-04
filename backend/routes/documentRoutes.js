import express from "express";
import {
     uploadDocument,
     processDocument,
     getDocumentStatus
 } from "../controllers/documentController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { getUserDocuments } from "../controllers/documentController.js";
import { getDocumentById } from "../controllers/documentController.js";

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
  "/user",
   authMiddleware, 
   getUserDocuments);

router.get(
  "/:documentId/status",
  authMiddleware,
  getDocumentStatus
);

router.get(
  "/:documentId",
  authMiddleware,
  getDocumentById
);

export default router;
