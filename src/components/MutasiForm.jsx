import { useState } from "react";
import axios from "axios";

export default function MutasiForm({ item, onActivitySuccess }) {
  const [jumlah, setJumlah] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jumlah || jumlah <= 0) return alert("Jumlah harus lebih dari 0");

    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `https://faststock-clone-be.vercel.app/api/items/process/${item._id}`, // Endpoint diubah
        {
          actionType: "mutasi", // Properti tambahan wajib
          jumlah: parseInt(jumlah),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      onActivitySuccess?.(); // 2️⃣ refresh log (LogList)
      setJumlah(""); // 3️⃣ reset form
    } catch (err) {
      alert(err.response?.data?.error || "Gagal memutasi stok");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
      <input
        type="number"
        value={jumlah}
        onChange={(e) => setJumlah(e.target.value)}
        placeholder="Jumlah Mutasi"
        className="border rounded px-2 py-1 w-32"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-3 py-1 rounded"
      >
        Mutasi
      </button>
    </form>
  );
}
