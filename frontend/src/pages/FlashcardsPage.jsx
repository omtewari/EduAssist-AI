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
import {
  fetchFlashcardDeckForDocument,
  clearFlashcards,
} from "../redux/slices/flashcardSlice";
import { setFlashcardTotal } from "../redux/slices/progressSlice";
import FlashcardFlip from "../components/FlashcardFlip";

export default function FlashcardsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const doc = useSelector((s) => s.document.selectedDocument);
  const detailLoading = useSelector((s) => s.document.detailLoading);
  const processLoading = useSelector((s) => s.document.processLoading);
  const { flashcards, loading: fcLoading } = useSelector((s) => s.flashcards);

  const deckLoadedRef = useRef(false);

  useEffect(() => {
    if (!id) return undefined;
    deckLoadedRef.current = false;
    dispatch(fetchDocumentById(id));
    return () => {
      dispatch(clearSelectedDocument());
      dispatch(clearFlashcards());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (doc?.status !== "completed") {
      deckLoadedRef.current = false;
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
    if (deckLoadedRef.current) return;
    deckLoadedRef.current = true;
    dispatch(fetchFlashcardDeckForDocument(id));
  }, [id, doc?.status, dispatch]);

  useEffect(() => {
    if (!id || doc?.status !== "completed" || fcLoading) return;
    dispatch(
      setFlashcardTotal({
        documentId: id,
        total: flashcards.length,
      })
    );
  }, [id, doc?.status, fcLoading, flashcards.length, dispatch]);

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
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-xl bg-gray-100" />
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

      <h1 className="text-3xl font-bold text-gray-800 mb-1">Flashcards</h1>
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
            Flashcards will load automatically when ready.
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
          {fcLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : flashcards.length === 0 ? (
            <p className="text-gray-500">No flashcards for this document.</p>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-4">
                Tap a card to flip between question and answer.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {flashcards.map((card) => (
                  <FlashcardFlip
                    key={card._id}
                    documentId={id}
                    cardId={card._id}
                    question={card.question}
                    answer={card.answer}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
