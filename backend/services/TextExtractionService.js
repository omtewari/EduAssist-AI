import axios from "axios";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const extractTextFromPDF = async (fileUrl) => {
  try {
    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer",
      timeout: 120000,
    });
    const dataBuffer = Buffer.from(response.data);

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