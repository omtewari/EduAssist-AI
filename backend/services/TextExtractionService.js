// backend/services/TextExtractionService.js

import fs from "fs";
import * as pdfParse from "pdf-parse";

/**
 * Extract text from a PDF file
 * @param {string} filePath - Absolute or relative path to PDF file
 * @returns {Promise<{ success: boolean, text?: string, error?: string }>}
 */
const extractTextFromPDF = async (filePath) => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: "File not found",
      };
    }

    // Read file buffer
    const dataBuffer = fs.readFileSync(filePath);

    // Parse PDF
    const data = await pdfParse.default(dataBuffer);

    // Clean text (remove excessive newlines)
    const cleanedText = data.text
      .replace(/\r\n/g, "\n")
      .replace(/\n\s*\n/g, "\n")
      .trim();

    if (!cleanedText || cleanedText.length === 0) {
      return {
        success: false,
        error: "No text extracted from PDF",
      };
    }

    return {
      success: true,
      text: cleanedText,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to extract text from PDF",
    };
  }
};

export default extractTextFromPDF;
