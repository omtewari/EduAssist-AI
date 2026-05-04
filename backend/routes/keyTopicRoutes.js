import express from "express";
import KeyTopicController from "../controllers/keyTopicController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router =
  express.Router();

router.post(
  "/document/:documentId/generate",
  authMiddleware,
  KeyTopicController.generateForDocument
);

router.get(
  "/document/:documentId",
  authMiddleware,
  KeyTopicController.getByDocument
);

router.get(
  "/user",
  authMiddleware,
  KeyTopicController.getByUser
);

router.delete(
  "/document/:documentId",
  authMiddleware,
  KeyTopicController.deleteByDocument
);

export default router;