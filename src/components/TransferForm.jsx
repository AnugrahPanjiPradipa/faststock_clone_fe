import { useEffect, useState } from "react";
import axios from "axios";

export default function TransferForm({
  item,
  onActivitySuccess,
}) {
  const [jumlah, setJumlah] = useState("");
  const [geraiList, setGeraiList] = useState([]);
  const [selectedGerai, setSelectedGerai] = useState("");


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
    if (!jumlah || jumlah <= 0) return alert("Jumlah harus lebih dari 0");

    try {
      await axios.put(
  `https://faststock-backend.vercel.app/api/items/transfer/${item._id}`,
  {
    jumlah: parseInt(jumlah),
    tujuan: selectedGerai,
  }
);

      onActivitySuccess?.(); // 2️⃣ refresh log (LogList)
      setJumlah(""); // 3️⃣ reset form
    } catch (err) {
  console.log("ERROR:", err.response?.data);
  alert(err.response?.data?.error || err.response?.data?.detail || "Gagal transfer stok");
}
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2 md:flex-row flex-col">
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
          className="border p-2 w-32">
            {geraiList.map((gerai) => (
                <option key={gerai._id}>{gerai.gerai}</option>
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
