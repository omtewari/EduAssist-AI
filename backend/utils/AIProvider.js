import axios from "axios";

class AIProvider {
  constructor() {
    this.model = "facebook/bart-large-cnn";

    // ✅ UPDATED HF ROUTER ENDPOINT
    this.apiUrl =
      `https://router.huggingface.co/hf-inference/models/${this.model}?wait_for_model=true`;
  }

  async generateText(text) {
    if (!process.env.HF_API_KEY) {
      throw new Error("HF_API_KEY is missing. Check .env loading.");
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          inputs: text,
          parameters: {
            max_length: 200,
            min_length: 80,
            do_sample: false
          }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          timeout: 120000 // allow cold start
        }
      );

      return response.data[0].summary_text;
    } catch (error) {
      console.error("[HF STATUS]:", error.response?.status);
      console.error("[HF DATA]:", error.response?.data);
      throw new Error("Failed to generate AI summary");
    }
  }

  getModelName() {
    return this.model;
  }
}

export default new AIProvider();
