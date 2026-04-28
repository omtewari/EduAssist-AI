import axios from "axios";

class AIProvider {
  constructor() {
    this.model = "facebook/bart-large-cnn";

    // Keep same Hugging Face router endpoint
    this.apiUrl =
      `https://router.huggingface.co/hf-inference/models/${this.model}?wait_for_model=true`;
  }

  /**
   * Shared request method
   */
  async requestAI(inputs, parameters = {}) {
    if (!process.env.HF_API_KEY) {
      throw new Error(
        "HF_API_KEY is missing. Check .env loading."
      );
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          inputs,
          parameters,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 120000,
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "[HF STATUS]:",
        error.response?.status
      );
      console.error(
        "[HF DATA]:",
        error.response?.data
      );

      throw new Error("AI generation failed.");
    }
  }

  /**
   * Summary Generation
   */
  async generateSummary(text) {
    const result = await this.requestAI(
      text,
      {
        max_length: 200,
        min_length: 80,
        do_sample: false,
      }
    );

    return (
      result?.[0]?.summary_text || ""
    );
  }

  /**
   * Flashcard Generation
   * Uses same BART model
   */
  async generateFlashcards(prompt) {
    const result = await this.requestAI(
      prompt,
      {
        max_length: 300,
        min_length: 120,
        do_sample: false,
      }
    );

    return (
      result?.[0]?.summary_text ||
      result?.[0]?.generated_text ||
      ""
    );
  }

  /**
   * Generic text method (optional)
   */
  async generateText(text) {
    return await this.generateSummary(text);
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
}

export default new AIProvider();