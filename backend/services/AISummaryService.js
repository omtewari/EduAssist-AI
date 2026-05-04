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

    if (chunks.length === 0) {
      throw new Error("No valid chunks generated for summarization");
    }

    // 3️⃣ Generate bullet summaries per chunk
    let allBullets = [];

    const chunkErrors = [];

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

      try {
        const bulletText = await AIProvider.generateSummary(prompt);

        if (!bulletText || !bulletText.trim()) {
          chunkErrors.push("AI returned empty summary output");
          continue;
        }

        const bullets = this.parseBullets(bulletText);
        if (bullets.length === 0) {
          chunkErrors.push("AI output could not be parsed into bullet points");
          continue;
        }

        allBullets.push(...bullets);
      } catch (error) {
        chunkErrors.push(error.message);
      }
    }

    // 4️⃣ Deduplicate & limit bullets
    const uniqueBullets = [...new Set(allBullets)].slice(0, 7);

    if (uniqueBullets.length === 0) {
      const detail = chunkErrors[0] || "No usable summary produced";
      throw new Error(`Summary generation produced no bullets. ${detail}`);
    }

    return {
      summaryText: uniqueBullets.join(" "),
      bulletPoints: uniqueBullets,
      wordCount: uniqueBullets.join(" ").split(" ").length,
      modelUsed: AIProvider.getAvailableModels().summary,
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
      .map((line) => line.replace(/^[-•*\d.]+\s*/, "").trim())
      .filter((line) => line.length > 0);
  }

  /**
   * Break long text into safe chunks
   */
  chunkText(text, chunkSize = 1800) {
    if (!text || !text.trim()) {
      return [];
    }

    const chunks = [];
    const sentences = text.split(/(?<=[.!?])\s+/);
    let currentChunk = "";

    for (const sentence of sentences) {
      const candidate = currentChunk
        ? `${currentChunk} ${sentence}`
        : sentence;

      if (candidate.length <= chunkSize) {
        currentChunk = candidate;
        continue;
      }

      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }

      if (sentence.length > chunkSize) {
        for (let i = 0; i < sentence.length; i += chunkSize) {
          chunks.push(sentence.slice(i, i + chunkSize).trim());
        }
        currentChunk = "";
      } else {
        currentChunk = sentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.filter(Boolean);
  }
}

export default new AISummaryService();
