import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  uploadDocument,
  startDocumentProcessing,
} from "../redux/slices/documentSlice";

export default function UploadPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const uploadLoading = useSelector((s) => s.document.uploadLoading);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);

  const pickPdf = useCallback((f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error("Please choose a PDF file.");
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    pickPdf(f);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a PDF file.");
      return;
    }

    setProgress(0);
    const up = await dispatch(
      uploadDocument({
        file,
        title,
        onProgress: setProgress,
      })
    );

    if (!uploadDocument.fulfilled.match(up)) {
      toast.error(up.payload || "Upload failed");
      return;
    }

    const documentId = up.payload.documentId;
    toast.success("Upload complete. Starting processing…");

    const proc = await dispatch(startDocumentProcessing(documentId));
    if (!startDocumentProcessing.fulfilled.match(proc)) {
      toast.error(proc.payload || "Could not start processing");
      navigate("/dashboard");
      return;
    }

    toast.success("Document is processing. You can track it on the dashboard.");
    navigate("/dashboard");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload</h1>
      <p className="text-gray-500 mb-8">
        Add a PDF title (optional), then upload your study material.
      </p>

      <div className="max-w-lg space-y-6">
        <div>
          <label
            htmlFor="docTitle"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            id="docTitle"
            type="text"
            placeholder="e.g. Chapter 3 — Cell biology"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div
          role="presentation"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer ${
            dragOver
              ? "border-indigo-500 bg-indigo-50"
              : "border-indigo-200 hover:bg-indigo-50/50"
          }`}
        >
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            id="fileUpload"
            onChange={(e) => pickPdf(e.target.files?.[0])}
          />
          <label htmlFor="fileUpload" className="cursor-pointer block">
            <p className="text-gray-700 font-medium">
              {file ? file.name : "Drop PDF here or click to browse"}
            </p>
            <p className="text-sm text-gray-400 mt-2">PDF only</p>
          </label>
        </div>

        {uploadLoading && progress > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Uploading</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploadLoading || !file}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
        >
          {uploadLoading ? "Working…" : "Upload & process"}
        </button>
      </div>
    </div>
  );
}
