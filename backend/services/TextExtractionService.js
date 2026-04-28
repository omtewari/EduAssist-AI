import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const extractTextFromPDF = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: "File not found",
      };
    }

    const dataBuffer = fs.readFileSync(filePath);

    const data = await pdfParse(dataBuffer);

    const cleanedText = data.text
      .replace(/\r\n/g, "\n")
      .replace(/\n\s*\n/g, "\n")
      .trim();

    if (!cleanedText) {
      return {
        success: false,
        error: "No text extracted from PDF",
      };
    }

    return {
      success: true,
      text: cleanedText,
      pageCount: data.numpages || 0,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export default extractTextFromPDF;