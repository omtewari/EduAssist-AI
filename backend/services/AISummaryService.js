import AIProvider from "../utils/AIProvider.js";

class AISummaryService {
  /**
   * Main entry point for AI bullet-point summarization
   */
  async generateSummary({ text }) {
    if (!text || text.trim().length === 0) {
      throw new Error("No extracted text provided for summarization");
    }

    // 1️⃣ Clean text
    const cleanedText = this.preprocessText(text);

    // 2️⃣ Chunk text safely
    const chunks = this.chunkText(cleanedText);

    // 3️⃣ Generate bullet summaries per chunk
    let allBullets = [];

    for (const chunk of chunks) {
      const prompt = `
Summarize the following educational content into clear bullet points.

Rules:
- Use 5 to 7 bullet points
- Each bullet must be one clear sentence
- Do NOT add external information
- Ignore website links, phone numbers, or ads

Content:
${chunk}
      `.trim();

      const bulletText = await AIProvider.generateText(prompt);
      const bullets = this.parseBullets(bulletText);

      allBullets.push(...bullets);
    }

    // 4️⃣ Deduplicate & limit bullets
    const uniqueBullets = [...new Set(allBullets)].slice(0, 7);

    return {
      summaryText: uniqueBullets.join(" "),
      bulletPoints: uniqueBullets,
      wordCount: uniqueBullets.join(" ").split(" ").length,
      modelUsed: AIProvider.getModelName(),
      generatedAt: new Date()
    };
  }

  /**
   * Clean extracted PDF text
   */
  preprocessText(text) {
    return text
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\bPage\s+\d+\b/gi, "")
      .trim();
  }

  /**
   * Parse bullet points from AI output
   */
  parseBullets(text) {
    return text
      .split("\n")
      .map(line => line.replace(/^[-•*]\s*/, "").trim())
      .filter(line => line.length > 0);
  }

  /**
   * Break long text into safe chunks
   */
  chunkText(text, chunkSize = 2500) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
      chunks.push(text.slice(start, start + chunkSize));
      start += chunkSize;
    }

    return chunks;
  }
}

export default new AISummaryService();
