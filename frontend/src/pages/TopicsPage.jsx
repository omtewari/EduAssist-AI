import { useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchDocumentById,
  fetchDocumentStatus,
  startDocumentProcessing,
  clearSelectedDocument,
} from "../redux/slices/documentSlice";
import { fetchTopicsForDocument, clearTopics } from "../redux/slices/topicSlice";
import { setTopicsSeen } from "../redux/slices/progressSlice";

export default function TopicsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const doc = useSelector((s) => s.document.selectedDocument);
  const detailLoading = useSelector((s) => s.document.detailLoading);
  const processLoading = useSelector((s) => s.document.processLoading);
  const { topics, loading: topicsLoading } = useSelector((s) => s.topics);

  const topicsLoadedRef = useRef(false);
  const topicsProgressMarkedRef = useRef(false);

  useEffect(() => {
    topicsProgressMarkedRef.current = false;
  }, [id]);

  useEffect(() => {
    if (!id) return undefined;
    topicsLoadedRef.current = false;
    dispatch(fetchDocumentById(id));
    return () => {
      dispatch(clearSelectedDocument());
      dispatch(clearTopics());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (doc?.status !== "completed") {
      topicsLoadedRef.current = false;
    }
  }, [doc?.status]);

  const processing =
    doc?.status === "processing" || doc?.status === "uploaded";

  useEffect(() => {
    if (!id || !processing) return undefined;
    const iv = setInterval(() => {
      dispatch(fetchDocumentStatus(id));
    }, 4000);
    return () => clearInterval(iv);
  }, [id, processing, dispatch]);

  useEffect(() => {
    if (!id || doc?.status !== "completed") return;
    if (topicsLoadedRef.current) return;
    topicsLoadedRef.current = true;
    dispatch(fetchTopicsForDocument(id));
  }, [id, doc?.status, dispatch]);

  useEffect(() => {
    if (!id || doc?.status !== "completed" || topicsLoading) return;
    if (topicsProgressMarkedRef.current) return;
    topicsProgressMarkedRef.current = true;
    dispatch(setTopicsSeen({ documentId: id, seen: true }));
  }, [id, doc?.status, topicsLoading, dispatch]);

  const handleRetry = async () => {
    const result = await dispatch(startDocumentProcessing(id));
    if (startDocumentProcessing.fulfilled.match(result)) {
      toast.success("Processing restarted");
      dispatch(fetchDocumentById(id));
    } else {
      toast.error(result.payload || "Could not restart");
    }
  };

  const title =
    doc?.title?.trim() || doc?.originalFileName || "Document";

  if (!id) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  if (detailLoading && !doc) {
    return (
      <div className="max-w-4xl animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center text-red-600 py-12">
        <p className="mb-4">Document not found.</p>
        <Link to="/dashboard" className="text-indigo-600 font-medium hover:underline">
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
        <Link
          to={`/document/${id}`}
          className="text-indigo-600 hover:underline"
        >
          ← Back to document
        </Link>
        <span className="text-gray-300">|</span>
        <Link to="/dashboard" className="text-gray-500 hover:text-gray-800">
          Dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-1">Key topics</h1>
      <p className="text-gray-600 mb-2">{title}</p>
      <p className="text-sm text-gray-500 capitalize mb-8">
        Status: <span className="font-semibold">{doc.status}</span>
      </p>

      {processing && (
        <div className="flex flex-col items-center py-16 px-4 bg-white rounded-xl shadow border border-amber-100 mb-8">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-700 font-medium text-center">
            Your document is still processing…
          </p>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Topics will load automatically when ready.
          </p>
        </div>
      )}

      {doc.status === "failed" && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 mb-8">
          <p className="text-red-800 font-medium">Processing failed</p>
          {doc.errorMessage && (
            <p className="text-sm text-red-700 mt-2">{doc.errorMessage}</p>
          )}
          <button
            type="button"
            disabled={processLoading}
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
          >
            {processLoading ? "Starting…" : "Retry processing"}
          </button>
        </div>
      )}

      {doc.status === "completed" && (
        <>
          {topicsLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-24 rounded-full bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : topics.length === 0 ? (
            <p className="text-gray-500">No topics extracted yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <span
                  key={t._id}
                  title={t.description || undefined}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-900 border border-emerald-100 cursor-default"
                >
                  {t.title}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
