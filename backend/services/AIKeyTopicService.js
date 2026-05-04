import AIProvider from "../utils/AIProvider.js";
import KeyTopic from "../models/KeyTopic.js";

class AIKeyTopicService {
  async generateTopics({
    text,
    documentId,
    userId,
    count = 10,
  }) {
    if (!text || !text.trim()) {
      throw new Error("No content provided.");
    }

    let topics = [];

    try {
      const aiResponse = await AIProvider.extractTopics(
        text.slice(0, 3000),
        count
      );

      console.log("🧠 AI RAW TOPICS RESPONSE:", aiResponse);

      topics = this.cleanTopics(aiResponse);

      // 🚨 If AI gave bad output → fallback
      if (!topics || topics.length === 0) {
        throw new Error("Invalid AI topic output");
      }
    } catch (error) {
      console.log(
        "⚠️ AI topic extraction failed. Using fallback...",
        error.message
      );

      topics = this.ruleBasedTopics(text, count);
    }

    // 🔥 Remove old topics
    await KeyTopic.deleteMany({
      documentId,
      userId,
    });

    // 💾 Save new topics
    const savedTopics = await Promise.all(
      topics.slice(0, count).map(async (topic, index) => {
        return await KeyTopic.create({
          documentId,
          userId,
          title: topic.title,
          description:
            topic.description ||
            `Important topic related to ${topic.title}`,
          confidenceScore:
            topic.confidenceScore ??
            Math.max(0.5, 1 - index * 0.08),
        });
      })
    );

    return savedTopics;
  }

  // ✅ CLEAN + VALIDATE AI OUTPUT
  cleanTopics(data) {
    let topics = [];

    // Case 1: Already array
    if (Array.isArray(data)) {
      topics = data;
    }

    // Case 2: JSON string or raw text
    else if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);

        if (Array.isArray(parsed)) {
          topics = parsed;
        }
      } catch {
        // 🔥 Split by sentences or new lines
        topics = data
          .split(/\n|\. /)
          .map((item) =>
            item.replace(/^[-*\d.]+\s*/, "").trim()
          )
          .filter(
            (item) =>
              item.length > 5 &&
              item.length < 100 // prevent huge chunks
          );
      }
    }

    // 🚨 FINAL CLEANING
    return topics
      .map((item) => {
        if (typeof item === "string") {
          return {
            title: item.slice(0, 80),
            description: "",
            confidenceScore: 0.8,
          };
        }

        return {
          title: (
            item.title ||
            item.topic ||
            "Untitled Topic"
          ).slice(0, 80),
          description: (
            item.description || ""
          ).slice(0, 200),
          confidenceScore:
            item.confidenceScore ?? 0.8,
        };
      })
      .filter(
        (t) =>
          t.title &&
          t.title.length > 3 &&
          t.title.length < 100
      );
  }

  // ✅ SMART FALLBACK (sentence-based, not random words)
  ruleBasedTopics(text, count) {
    const sentences = text
      .split(". ")
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    return sentences
      .slice(0, count)
      .map((sentence, index) => ({
        title: sentence.slice(0, 60),
        description: sentence,
        confidenceScore: Math.max(
          0.5,
          1 - index * 0.08
        ),
      }));
  }
}

export default new AIKeyTopicService();