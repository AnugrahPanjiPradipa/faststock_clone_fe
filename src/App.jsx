import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";
import LogList from "./components/LogList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

function Dashboard() {
  const [reload, setReload] = useState(false);
  const [logRefreshKey, setLogRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  // Ambil role dari localStorage untuk mengecek apakah user adalah admin atau staff
  const userRole = localStorage.getItem("role");

  // 🔹 Satu fungsi untuk refresh ItemList dan LogList
  const refreshLogsAndItems = () => {
    setLogRefreshKey((prev) => prev + 1); // refresh LogList
    setReload((prev) => !prev); // trigger refresh ke ItemList
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
            Dashboard Stok Gudang & Etalase
            {/* Indikator Role Opsional */}
            <span className="text-sm ml-2 px-2 py-1 bg-gray-200 rounded text-gray-700 uppercase">
              {userRole}
            </span>
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 w-full sm:w-auto"
          >
            Logout
          </button>
        </div>

        {/* Tombol & Form Tambah Barang - HANYA MUNCUL JIKA ADMIN */}
        {userRole === "admin" && (
          <>
            <div className="flex justify-center sm:justify-end mb-6">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
              >
                {showForm ? "Sembunyikan Form" : "Tambah Barang"}
              </button>
            </div>

            {/* Form Tambah Barang */}
            {showForm && (
              <div className="mb-6">
                <ItemForm
                  onSuccess={() => setReload(!reload)}
                  onActivitySuccess={refreshLogsAndItems}
                />
              </div>
            )}
          </>
        )}

        {/* List Item - Teruskan userRole ke komponen jika butuh RBAC di dalam tabel */}
        <div className="mb-8">
          <ItemList
            refreshTrigger={reload}
            onActivitySuccess={refreshLogsAndItems}
            userRole={userRole} // Oper data role agar di dalam ItemList tombol hapus/edit bisa disembunyikan
          />
        </div>

        {/* Audit Stok */}
        <h2 className="text-2xl font-bold text-center mt-8 mb-4">
          Audit Stok Obat
        </h2>
        <LogList
          refreshKey={logRefreshKey}
          onActivitySuccess={refreshLogsAndItems}
          userRole={userRole} // Oper data role agar di dalam LogList tombol hapus/rollback bisa disembunyikan
        />
      </div>
    </div>
  );
}

// Protected Route untuk membatasi akses (Harus Login)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Public Route untuk halaman login/register
function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Login & Register (Public Route) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        {/* Halaman Reset & Forgot Password (Public Route) */}
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <PublicRoute>
              <VerifyEmail />
            </PublicRoute>
          }
        />

        {/* Halaman Dashboard (Protected Route) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirect jika route tidak ditemukan */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
