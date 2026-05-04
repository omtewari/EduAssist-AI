import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layouts/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import DocumentView from "./pages/DocumentView";
import ProfilePage from "./pages/ProfilePage";
import FlashcardsPage from "./pages/FlashcardsPage";
import TopicsPage from "./pages/TopicsPage";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="document/:id" element={<DocumentView />} />
            <Route path="flashcards/:id" element={<FlashcardsPage />} />
            <Route path="topics/:id" element={<TopicsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
