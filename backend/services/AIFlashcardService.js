import AIProvider from "../utils/AIProvider.js";

class AIFlashcardService {
  async generateFlashcards({
    text,
    count = 10,
  }) {
    if (!text || !text.trim()) {
      throw new Error(
        "No content provided."
      );
    }

    const cleanedText =
      this.preprocessText(text);

    const flashcards =
      this.textToFlashcards(
        cleanedText,
        count
      );

    if (!flashcards.length) {
      throw new Error(
        "Failed to generate flashcards."
      );
    }

    return {
      flashcards,
      totalCards:
        flashcards.length,
      modelUsed:
        "Rule-Based NLP v2",
      generatedAt:
        new Date(),
    };
  }

  preprocessText(text) {
    return text
      .replace(/\r\n/g, " ")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  textToFlashcards(
    text,
    count
  ) {
    const sentences = text
      .split(/[.!?]/)
      .map((s) => s.trim())
      .filter(
        (s) => s.length > 15
      );

    const cards = [];

    for (const sentence of sentences) {
      if (
        cards.length >= count
      )
        break;

      const question =
        this.generateQuestion(
          sentence
        );

      if (question) {
        cards.push({
          question,
          answer:
            sentence.trim(),
          difficulty:
            this.getDifficulty(
              sentence
            ),
        });
      }
    }

    return cards;
  }

  generateQuestion(
    sentence
  ) {
    const words =
      sentence.split(" ");

    // Definition
    if (
      sentence.includes(
        " is "
      )
    ) {
      const term =
        sentence
          .split(" is ")[0]
          .trim();

      if (
        term.length < 40
      ) {
        return `What is ${term}?`;
      }
    }

    // Who discovered/invented/founded
    if (
      sentence.match(
        /discovered|invented|founded|created/i
      )
    ) {
      const rest =
        sentence
          .replace(
            /^[A-Z][a-z]+\s*/,
            ""
          )
          .trim();

      return `Who ${rest}?`;
    }

    // Year/date
    if (
      sentence.match(
        /\b(18|19|20)\d{2}\b/
      )
    ) {
      return `When did ${words
        .slice(0, 4)
        .join(" ")} happen?`;
    }

    // Capital / location
    if (
      sentence.match(
        /capital of/i
      )
    ) {
      const match =
        sentence.match(
          /capital of (.+?) is/i
        );

      if (match) {
        return `What is the capital of ${match[1]}?`;
      }
    }

    // Process / uses / causes
    if (
      sentence.match(
        /process|causes|uses|consists of|includes/i
      )
    ) {
      return `Explain ${words
        .slice(0, 4)
        .join(" ")}?`;
    }

    // Abbreviation
    if (
      sentence.match(
        /\b[A-Z]{2,}\b/
      )
    ) {
      const abbr =
        sentence.match(
          /\b[A-Z]{2,}\b/
        )[0];

      return `What does ${abbr} stand for?`;
    }

    // Default factual sentence
    if (
      words.length >= 5
    ) {
      return `Explain ${words
        .slice(0, 3)
        .join(" ")}?`;
    }

    return null;
  }

  getDifficulty(
    sentence
  ) {
    const length =
      sentence.split(" ")
        .length;

    if (length <= 8)
      return "easy";
    if (length <= 16)
      return "medium";
    return "hard";
  }
}

export default new AIFlashcardService();