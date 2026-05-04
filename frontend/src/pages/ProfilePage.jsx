import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDocuments } from "../redux/slices/documentSlice";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { documents, listLoading } = useSelector((s) => s.document);

  useEffect(() => {
    dispatch(fetchUserDocuments());
  }, [dispatch]);

  const count = documents?.length ?? 0;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase">
            Username
          </p>
          <p className="text-lg text-gray-900">{user?.username || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase">
            Email
          </p>
          <p className="text-lg text-gray-900">{user?.email || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase">
            Uploaded documents
          </p>
          <p className="text-lg text-gray-900">
            {listLoading ? "…" : count}
          </p>
        </div>
      </div>
    </div>
  );
}
