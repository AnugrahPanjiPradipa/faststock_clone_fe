import { useState } from "react";
import axios from "axios";

export default function PenjualanForm({ item, onSuccess, onActivitySuccess }) {
  const [jumlah, setJumlah] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jumlah || jumlah <= 0) return alert("Jumlah harus lebih dari 0");

    try {
      await axios.put(
        `http://localhost:5000/api/items/penjualan/${item._id}`,
        {
          jumlah: parseInt(jumlah),
        },
      );

      onSuccess?.(); // 1️⃣ refresh stok (ItemList)
      onActivitySuccess?.(); // 2️⃣ refresh log (LogList)
      setJumlah(""); // 3️⃣ reset form
    } catch (err) {
      alert(err.response?.data?.error || "Gagal melakukan penjualan");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
      <input
        type="number"
        value={jumlah}
        onChange={(e) => setJumlah(e.target.value)}
        placeholder="Jumlah Terjual"
        className="border rounded px-2 py-1 w-32"
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-3 py-1 rounded"
      >
        Jual
      </button>
    </form>
  );
}
