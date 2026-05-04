import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ReadingProgressRing from "./ReadingProgressRing";
import { computeReadingPercent } from "../utils/readingProgress";
import { parseDocumentIdFromPath } from "../utils/routeDocumentId";

export default function ReadingProgressTracker() {
  const location = useLocation();
  const docId = parseDocumentIdFromPath(location.pathname);

  const docProgress = useSelector((s) =>
    docId ? s.progress.documents[String(docId)] : null
  );

  const title = useSelector((s) => {
    if (!docId) return "";
    const d = s.document.selectedDocument;
    if (!d || String(d._id) !== String(docId)) return "";
    return d.title?.trim() || d.originalFileName || "";
  });

  const stats = useMemo(
    () => computeReadingPercent(docProgress),
    [docProgress]
  );

  if (!docId) return null;

  return (
    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-2 py-1.5 bg-white/80 shadow-sm max-w-[min(100%,14rem)] sm:max-w-none">
      <ReadingProgressRing docProgress={docProgress} title={title} />
      <div className="hidden sm:flex flex-col text-[10px] leading-tight text-gray-500 pr-1 min-w-0">
        <span className="truncate">
          Cards{" "}
          <span className="font-semibold text-gray-700">{stats.flash}%</span>
        </span>
        <span className="truncate">
          Summary{" "}
          <span className="font-semibold text-gray-700">
            {stats.summary}%
          </span>
        </span>
        <span className="truncate">
          Topics{" "}
          <span className="font-semibold text-gray-700">{stats.topics}%</span>
        </span>
      </div>
    </div>
  );
}
