import dotenv from "dotenv";
dotenv.config();
import AIProvider from "./utils/AIProvider.js";

const run = async () => {
  const text =
   ` Artificial intelligence is a branch of computer science.
It enables machines to learn from their environment.
The goal of AI is to make machines more intelligent.`;

  const result = await AIProvider.generateText(text);
  console.log("HF OUTPUT:\n", result);
};

run();
