/**
 * One-third of overall progress each: flashcards studied, summary read, topics seen.
 * Overall = round((flash + summary + topics) / 3).
 */
export function defaultDocProgress() {
  return {
    flippedIds: {},
    totalFlashcards: null,
    summaryComplete: false,
    topicsSeen: false,
  };
}

export function computeReadingPercent(docProgress) {
  const d = docProgress || defaultDocProgress();
  const flipped = Object.keys(d.flippedIds || {}).length;
  const total = d.totalFlashcards;

  const flash =
    total === null || total === undefined
      ? 0
      : total === 0
        ? 100
        : Math.min(
            100,
            Math.round(
              (Math.min(flipped, total) / total) * 100
            )
          );

  const summary = d.summaryComplete ? 100 : 0;
  const topics = d.topicsSeen ? 100 : 0;

  const overall = Math.round((flash + summary + topics) / 3);

  return { flash, summary, topics, overall };
}

export const READING_PROGRESS_STORAGE_KEY = "eduassist_reading_progress_v1";

export function loadReadingProgressFromStorage() {
  try {
    const raw = localStorage.getItem(READING_PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}
