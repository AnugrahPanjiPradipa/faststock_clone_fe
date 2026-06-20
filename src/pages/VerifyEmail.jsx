// src/pages/VerifyEmail.jsx
import { useEffect, useState, useRef } from "react"; // Tambahkan useRef
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../services/authService";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Sedang memverifikasi email kamu...");

  // Penanda agar API tidak dipanggil 2 kali oleh React StrictMode
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token verifikasi tidak valid atau tidak ditemukan.");
      return;
    }

    // Jika sudah pernah dipanggil, hentikan eksekusi
    if (hasFetched.current) return;
    hasFetched.current = true;

    const checkVerification = async () => {
      try {
        const res = await verifyEmail(token);
        setStatus("success");
        setMessage(res.message || "Email berhasil diverifikasi!");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.error ||
            "Gagal memverifikasi email. Token mungkin sudah kedaluwarsa.",
        );
      }
    };

    checkVerification();
  }, [token]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        {/* TAMPILAN SAAT LOADING */}
        {status === "loading" && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-600 animate-pulse">
              Memverifikasi...
            </h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {/* TAMPILAN SAAT BERHASIL */}
        {status === "success" && (
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-green-600">
              Berhasil!
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Pergi ke Halaman Masuk
            </button>
          </div>
        )}

        {/* TAMPILAN SAAT GAGAL / ERROR */}
        {status === "error" && (
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-red-600">
              Verifikasi Gagal
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate("/register")}
              className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Kembali ke Daftar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
