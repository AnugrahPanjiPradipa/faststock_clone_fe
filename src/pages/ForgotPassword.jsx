// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { forgotPassword } from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await forgotPassword(email);
      setMessage(res.message || "Email instruksi telah dikirim.");
    } catch (err) {
      setError(err.error || "Gagal mengirim email reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Lupa Password</h2>

        {error && (
          <p className="text-red-500 mb-2 text-sm text-center">{error}</p>
        )}
        {message && (
          <p className="text-green-500 mb-2 text-sm text-center">{message}</p>
        )}

        <p className="text-sm text-gray-600 mb-4 text-center">
          Masukkan email yang terdaftar, kami akan mengirimkan link untuk reset
          password.
        </p>

        <input
          type="email"
          placeholder="Masukkan Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Mengirim..." : "Kirim Link Reset"}
        </button>

        <div className="mt-4 text-center text-sm">
          <a href="/login" className="text-blue-500 hover:underline">
            Kembali ke Login
          </a>
        </div>
      </form>
    </div>
  );
}
