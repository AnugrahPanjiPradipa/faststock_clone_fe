// src/pages/Register.jsx
import { useState } from "react";
import { register } from "../services/authService";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Masukkan parameter email ke service
      await register(username, email, password, "user");
      setSuccess(
        "Pendaftaran berhasil! Silakan cek email kamu untuk verifikasi.",
      );
      setLoading(false);
      setError("");
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.error || err.message || "Pendaftaran gagal");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">DAFTAR</h2>

        {error && (
          <p className="text-red-500 mb-2 text-sm text-center">{error}</p>
        )}
        {success && (
          <p className="text-green-500 mb-2 text-sm text-center">{success}</p>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
          required
        />

        {/* Input Email Baru */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
          required
        />

        {/* Password Input + Eye Icon */}
        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
          >
            {showPassword ? (
              <EyeOffIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
        </button>

        <p className="mt-4 text-sm text-center">
          Sudah punya akun?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Masuk
          </a>
        </p>
      </form>
    </div>
  );
}
