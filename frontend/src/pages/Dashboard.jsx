import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchUserDocuments,
  startDocumentProcessing,
} from "../redux/slices/documentSlice";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-6 bg-gray-100 rounded-full w-24 mb-4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

function statusBadgeClass(status) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "processing":
      return "bg-amber-100 text-amber-800";
    case "uploaded":
      return "bg-sky-100 text-sky-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { documents, listLoading, processLoading, error } = useSelector(
    (s) => s.document
  );

  useEffect(() => {
    dispatch(fetchUserDocuments());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(String(error));
  }, [error]);

  const handleRetry = async (e, docId) => {
    e.stopPropagation();
    const result = await dispatch(startDocumentProcessing(docId));
    if (startDocumentProcessing.fulfilled.match(result)) {
      toast.success("Processing restarted");
      dispatch(fetchUserDocuments());
    } else {
      toast.error(result.payload || "Could not restart processing");
    }
  };

  const displayTitle = (doc) =>
    doc.title?.trim() || doc.originalFileName || "Untitled document";

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Your documents</h1>
      <p className="text-gray-500 mb-8">
        Open a document to view summary, flashcards, and key topics.
      </p>

      {listLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center text-gray-500">
          <p className="mb-4">No documents yet.</p>
          <button
            type="button"
            onClick={() => navigate("/upload")}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Upload a PDF
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc._id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/document/${doc._id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/document/${doc._id}`);
                }
              }}
              className="bg-white rounded-xl shadow-md p-5 cursor-pointer hover:shadow-lg transition text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <h2 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                {displayTitle(doc)}
              </h2>

              <span
                className={`inline-block px-3 py-1 text-xs font-medium rounded-full capitalize ${statusBadgeClass(
                  doc.status
                )}`}
              >
                {doc.status}
              </span>

              <p className="text-sm text-gray-400 mt-3">
                {doc.createdAt
                  ? `Uploaded ${new Date(doc.createdAt).toLocaleString()}`
                  : ""}
              </p>

              {doc.status === "failed" && (
                <button
                  type="button"
                  disabled={processLoading}
                  onClick={(e) => handleRetry(e, doc._id)}
                  className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                >
                  Retry processing
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
