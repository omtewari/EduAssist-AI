import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchDocumentById,
  fetchDocumentStatus,
  startDocumentProcessing,
  deleteDocument,
  clearSelectedDocument,
} from "../redux/slices/documentSlice";
import { clearFlashcards } from "../redux/slices/flashcardSlice";
import { clearTopics } from "../redux/slices/topicSlice";
import { setSummaryComplete } from "../redux/slices/progressSlice";

const SUMMARY_PREVIEW_LEN = 480;

function SummarySection({ documentId, status, processing, summaryText }) {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const didAutoCompleteSummary = useRef(false);
  const needsToggle = summaryText.length > SUMMARY_PREVIEW_LEN;
  const display =
    expanded || !needsToggle
      ? summaryText
      : `${summaryText.slice(0, SUMMARY_PREVIEW_LEN)}…`;

  useEffect(() => {
    didAutoCompleteSummary.current = false;
  }, [documentId]);

  useEffect(() => {
    if (!documentId || status !== "completed") return;
    if (!summaryText) {
      if (!didAutoCompleteSummary.current) {
        didAutoCompleteSummary.current = true;
        dispatch(setSummaryComplete({ documentId, complete: true }));
      }
      return;
    }
    if (needsToggle) return;
    if (didAutoCompleteSummary.current) return;
    didAutoCompleteSummary.current = true;
    dispatch(setSummaryComplete({ documentId, complete: true }));
  }, [
    documentId,
    status,
    summaryText,
    needsToggle,
    dispatch,
  ]);

  const handleToggleExpand = () => {
    setExpanded((prev) => {
      const next = !prev;
      if (next && documentId) {
        dispatch(setSummaryComplete({ documentId, complete: true }));
      }
      return next;
    });
  };

  return (
    <section className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Summary</h2>
      {status !== "completed" ? (
        <p className="text-gray-500 text-sm">
          {processing
            ? "Summary will appear when processing finishes."
            : "No summary available."}
        </p>
      ) : summaryText ? (
        <>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {display}
          </p>
          {needsToggle && (
            <button
              type="button"
              onClick={handleToggleExpand}
              className="mt-3 text-sm font-medium text-indigo-600 hover:underline"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </>
      ) : (
        <p className="text-gray-500">No summary available.</p>
      )}
    </section>
  );
}

export default function DocumentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const doc = useSelector((s) => s.document.selectedDocument);
  const detailLoading = useSelector((s) => s.document.detailLoading);
  const processLoading = useSelector((s) => s.document.processLoading);
  const deleteLoading = useSelector((s) => s.document.deleteLoading);

  const fullDocLoadedRef = useRef(false);

  useEffect(() => {
    if (!id) return undefined;
    fullDocLoadedRef.current = false;
    dispatch(fetchDocumentById(id));
    return () => {
      dispatch(clearSelectedDocument());
      dispatch(clearFlashcards());
      dispatch(clearTopics());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (doc?.status !== "completed") {
      fullDocLoadedRef.current = false;
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
    if (fullDocLoadedRef.current) return;
    fullDocLoadedRef.current = true;
    dispatch(fetchDocumentById(id));
  }, [id, doc?.status, dispatch]);

  const handleRetry = async () => {
    const result = await dispatch(startDocumentProcessing(id));
    if (startDocumentProcessing.fulfilled.match(result)) {
      toast.success("Processing restarted");
      dispatch(fetchDocumentById(id));
    } else {
      toast.error(result.payload || "Could not restart");
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this PDF and all generated study content?"
    );
    if (!confirmed) return;

    const result = await dispatch(deleteDocument(id));
    if (deleteDocument.fulfilled.match(result)) {
      toast.success("Document deleted");
      navigate("/dashboard");
    } else {
      toast.error(result.payload || "Could not delete document");
    }
  };

  if (detailLoading && !doc) {
    return (
      <div className="animate-pulse space-y-4 max-w-3xl">
        <div className="h-10 bg-gray-200 rounded w-2/3" />
        <div className="h-32 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center text-red-600 py-12">
        <p className="mb-4">Document not found.</p>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="text-indigo-600 font-medium hover:underline"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const title =
    doc.title?.trim() || doc.originalFileName || "Untitled document";
  const summaryText = doc?.summaryText?.trim() || "";

  return (
    <div className="max-w-4xl">
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="text-sm text-indigo-600 hover:underline mb-4"
      >
        ← Dashboard
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
      <p className="text-sm text-gray-500 mb-8 capitalize">
        Status:{" "}
        <span className="font-semibold text-gray-700">{doc.status}</span>
      </p>

      {processing && (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl shadow border border-amber-100 mb-8">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-700 font-medium text-center">
            Your document is being processed…
          </p>
          <p className="text-sm text-gray-500 mt-2 text-center">
            This page updates automatically. When processing finishes, use the
            buttons below the summary to open flashcards and key topics.
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

      <SummarySection
        key={id}
        documentId={id}
        status={doc.status}
        processing={processing}
        summaryText={summaryText}
      />

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <button
          type="button"
          disabled={deleteLoading}
          onClick={handleDelete}
          className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition shadow-sm disabled:opacity-60"
        >
          {deleteLoading ? "Deleting…" : "Delete PDF"}
        </button>
        {doc.status === "completed" ? (
          <>
            <Link
              to={`/flashcards/${id}`}
              className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
            >
              Browse flashcards
            </Link>
            <Link
              to={`/topics/${id}`}
              className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition shadow-sm"
            >
              Browse key topics
            </Link>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Flashcards and key topics will be available after processing
            completes.
          </p>
        )}
      </div>
    </div>
  );
}
