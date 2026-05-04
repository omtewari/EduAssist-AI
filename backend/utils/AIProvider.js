import axios from "axios";

class AIProvider {
  constructor() {
    this.model = "facebook/bart-large-cnn";
    this.timeoutMs = 120000;
    this.maxRetries = 2;
    this.retryableStatusCodes = new Set([429, 500, 502, 503, 504]);
    this.apiUrls = [
      `https://router.huggingface.co/hf-inference/models/${this.model}`,
      `https://api-inference.huggingface.co/models/${this.model}`,
    ];
  }

  /**
   * Shared request method
   */
  async requestAI(inputs, parameters = {}, options = {}) {
    if (!process.env.HF_API_KEY) {
      throw new Error("HF_API_KEY is missing. Check .env loading.");
    }

    if (!inputs || (typeof inputs === "string" && !inputs.trim())) {
      throw new Error("AI input cannot be empty.");
    }

    const requestPayload = {
      inputs,
      parameters,
      options: {
        wait_for_model: true,
        use_cache: true,
        ...options,
      },
    };

    for (const apiUrl of this.apiUrls) {
      for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
        try {
          const response = await axios.post(apiUrl, requestPayload, {
            headers: {
              Authorization: `Bearer ${process.env.HF_API_KEY}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: this.timeoutMs,
          });

          if (response?.data?.error) {
            throw this.createAIError({
              status: response.status,
              data: response.data,
              defaultMessage: "Hugging Face returned an error payload.",
            });
          }

          return response.data;
        } catch (error) {
          const status = error.response?.status ?? null;
          const isRetryable =
            !error.response || this.retryableStatusCodes.has(status);
          const hasRetriesLeft = attempt < this.maxRetries;
          const canTryAnotherEndpoint =
            attempt === this.maxRetries && apiUrl !== this.apiUrls[this.apiUrls.length - 1];

          console.error("[HF URL]:", apiUrl);
          console.error("[HF STATUS]:", status);
          console.error("[HF DATA]:", error.response?.data || error.message);

          if (isRetryable && hasRetriesLeft) {
            await this.sleep(800 * (attempt + 1));
            continue;
          }

          if (canTryAnotherEndpoint) {
            break;
          }

          throw this.createAIError({
            status,
            data: error.response?.data,
            defaultMessage: error.message,
          });
        }
      }
    }
  }

  /**
   * Summary Generation
   */
  async generateSummary(text) {
    const result = await this.requestAI(text, {
      max_length: 200,
      min_length: 80,
      do_sample: false,
    });

    return result?.[0]?.summary_text || result?.[0]?.generated_text || "";
  }

  /**
   * Flashcard Generation
   * Uses same BART model
   */
  async generateFlashcards(prompt) {
    const result = await this.requestAI(prompt, {
      max_length: 300,
      min_length: 120,
      do_sample: false,
    });

    return result?.[0]?.summary_text || result?.[0]?.generated_text || "";
  }

  /**
   * Generic text method (optional)
   */
  async generateText(text) {
    return await this.generateSummary(text);
  }

  /**
   * Topic extraction helper for key topic service
   */
  async extractTopics(text, count = 10) {
    const topicPrompt = [
      "Extract key learning topics from the text below.",
      `Return ONLY a JSON array of at most ${count} objects.`,
      'Each object must include: "title", "description", "confidenceScore".',
      "",
      "Text:",
      text,
    ].join("\n");

    const responseText = await this.generateFlashcards(topicPrompt);
    return responseText;
  }

  getAvailableModels() {
    return {
      summary: this.model,
      flashcards: this.model,
    };
  }

  getModelName() {
    return this.model;
  }

  createAIError({ status, data, defaultMessage }) {
    const safeReason = this.extractHFErrorMessage(data) || defaultMessage || "Unknown AI failure";
    const statusLabel = status ? `status=${status}` : "status=unknown";
    return new Error(`AI generation failed (${statusLabel}): ${safeReason}`);
  }

  extractHFErrorMessage(data) {
    if (!data) return null;
    if (typeof data === "string") return data.slice(0, 220);
    if (typeof data.error === "string") return data.error.slice(0, 220);
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "string") {
      return data[0].slice(0, 220);
    }
    return null;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default new AIProvider();