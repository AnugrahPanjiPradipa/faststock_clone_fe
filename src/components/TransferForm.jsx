import { useEffect, useState } from "react";
import axios from "axios";

export default function TransferForm({ item, onActivitySuccess }) {
  const [jumlah, setJumlah] = useState("");
  const [geraiList, setGeraiList] = useState([]);
  const [selectedGerai, setSelectedGerai] = useState("");

  // 1️⃣ Mengambil daftar gerai saat komponen dimuat (Murni GET, tidak butuh payload transaksi)
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch("http://localhost:5000/api/gerai", {
          headers: {
            Authorization: `Bearer ${token}`, // Mengirim token agar lolos middleware protect
          },
        });
        const result = await response.json();

        if (Array.isArray(result)) {
          setGeraiList(result);
          if (result.length > 0) {
            setSelectedGerai(result[0].gerai);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil daftar gerai:", error);
      }
    };

    fetchData();
  }, []);

  // 2️⃣ Mengirim aksi transfer ke Fat Controller Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jumlah || jumlah <= 0) return alert("Jumlah harus lebih dari 0");

    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `http://localhost:5000/api/items/process/${item._id}`, // 🔹 Mengarah ke route terpusat baru
        {
          actionType: "transfer", // 🔹 Properti wajib untuk dibaca di switch/if Express
          jumlah: parseInt(jumlah),
          tujuan: selectedGerai,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔹 Token otentikasi disertakan di sini
          },
        },
      );

      onActivitySuccess?.(); // Refresh log di dashboard
      setJumlah(""); // Reset input form
    } catch (err) {
      console.log("ERROR:", err.response?.data);
      alert(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Gagal transfer stok",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 mt-2 md:flex-row flex-col"
    >
      <input
        type="number"
        value={jumlah}
        onChange={(e) => setJumlah(e.target.value)}
        placeholder="Jumlah Transfer"
        className="border rounded px-2 py-1 w-32"
      />
      <div className="flex flex-row gap-2 h-10">
        <select
          value={selectedGerai}
          onChange={(e) => setSelectedGerai(e.target.value)}
          className="border p-2 w-32"
        >
          {geraiList.map((gerai) => (
            <option key={gerai._id} value={gerai.gerai}>
              {gerai.gerai}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-orange-600 text-white px-3 py-1 rounded"
        >
          Transfer
        </button>
      </div>
    </form>
  );
}
