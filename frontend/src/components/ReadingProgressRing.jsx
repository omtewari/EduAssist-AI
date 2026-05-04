import { computeReadingPercent } from "../utils/readingProgress";

const SIZE = 52;
const STROKE = 4;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

export default function ReadingProgressRing({ docProgress, title }) {
  const { flash, summary, topics, overall } = computeReadingPercent(docProgress);
  const offset = C - (overall / 100) * C;

  const tip = `Reading progress — ${overall}%\nFlashcards: ${flash}%\nSummary: ${summary}%\nKey topics: ${topics}%`;

  return (
    <div
      className="flex flex-col items-center shrink-0"
      title={tip}
    >
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          className="rotate-[-90deg]"
          aria-hidden
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className="text-gray-200"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
            className={
              overall >= 100
                ? "text-emerald-500"
                : overall >= 66
                  ? "text-indigo-500"
                  : "text-amber-500"
            }
            style={{ transition: "stroke-dashoffset 0.35s ease" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[11px] font-bold text-gray-800 tabular-nums">
            {overall}%
          </span>
        </span>
      </div>
      {title && (
        <span className="hidden lg:block text-[10px] text-gray-400 mt-0.5 max-w-[4.5rem] truncate text-center leading-tight">
          {title}
        </span>
      )}
    </div>
  );
}
