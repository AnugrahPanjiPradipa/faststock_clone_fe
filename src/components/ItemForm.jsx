import { useEffect, useState } from "react";
import axios from "axios";

export default function ItemForm({ onSuccess, onActivitySuccess }) {
  const [form, setForm] = useState({
    name: "",
    stockGudang: 0,
  });

  const [geraiList, setGeraiList] = useState([]);
  const [selectedGerai, setSelectedGerai] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "https://faststock-backend.vercel.app/api/gerai",
      );
      const result = await response.json();

      setGeraiList(result);

      if (result.length > 0) {
        setSelectedGerai(result[0].gerai);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGerai) {
      alert("Data gerai belum dimuat, silakan tunggu sebentar atau refresh.");
      return;
    }

    const payload = {
      name: form.name,
      stockGudang: Number(form.stockGudang),
      asal: selectedGerai, 
    };

    try {
      await axios.post(
        "https://faststock-backend.vercel.app/api/items",
        payload,
        {
          headers: { "Content-Type": "application/json" }, // Pastikan header ini ada
        },
      );

      setForm({ name: "", stockGudang: 0 });
      onActivitySuccess?.();
      onSuccess?.();
      alert("Berhasil simpan ke database!");
    } catch (err) {
      console.error("Detail Error:", err.response?.data || err.message);
      alert("Gagal simpan ke database!");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-4 shadow rounded max-w-md mx-auto mt-6 flex flex-col"
    >
      <h2 className="text-xl font-bold">Tambah Item Gudang</h2>
      <input
        type="text"
        name="name"
        placeholder="Nama item"
        className="w-full border p-2 rounded-xl"
        value={form.name}
        onChange={handleChange}
      />
      <input
        type="number"
        name="stockGudang"
        placeholder="Stok gudang"
        className="w-full border p-2 rounded-xl"
        value={form.stockGudang}
        onChange={handleChange}
      />
      <select
        id="gerai"
        name="gerai"
        value={selectedGerai}
        className="w-full border p-2 rounded-xl"
        onChange={(e) => setSelectedGerai(e.target.value)}
      >
        {geraiList.map((item) => (
          <option value={item.gerai} key={item.no}>
            {item.gerai}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Simpan
      </button>
    </form>
  );
}
