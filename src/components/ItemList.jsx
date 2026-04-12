import axios from "axios";
import { useEffect, useState } from "react";
import MutasiForm from "./MutasiForm";
import PenjualanForm from "./PenjualanForm";

export default function ItemList({ onActivitySuccess, refreshTrigger }) {
  const [items, setItems] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addStockGudang, setAddStockGudang] = useState(0);
  const [geraiList, setGeraiList] = useState([]);
  const [selectedGerai, setSelectedGerai] = useState("");

  const itemsPerPage = 10;

  const fetchItems = async () => {
    try {
      const res = await axios.get(
        "https://faststock-backend.vercel.app/api/items",
        {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
          },
        },
      );

      // ⬅️ Kalau di page sekarang kosong tapi masih ada page sebelumnya
      if (res.data.items.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
        return;
      }

      setItems(res.data.items);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    }
  };

  // 🔹 Fetch data tiap kali ganti halaman, search, atau refreshTrigger
  useEffect(() => {
    fetchItems();
  }, [currentPage, searchTerm, refreshTrigger]);

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

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus item ini?")) return;
    try {
      await axios.delete(
        `https://faststock-backend.vercel.app/api/items/${id}`,
      );
      onActivitySuccess?.(); // 🔹 trigger parent refresh ItemList + LogList
    } catch (error) {
      console.error("Gagal menghapus item:", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
      name: editName,
      addStockGudang: Number(addStockGudang),
      asal: selectedGerai, 
    };

      await axios.put(
        `https://faststock-backend.vercel.app/api/items/${editItem._id}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      setEditItem(null);
      setEditName("");
      setAddStockGudang(0);
      setSelectedGerai("");
      onActivitySuccess?.();
    } catch (err) {
      console.error("Gagal update:", err);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-4">
      {/* Search */}
      <div className="mb-4 max-w-md">
        <input
          type="text"
          placeholder="Cari nama obat..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 w-full rounded"
        />
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items
          .filter((item) => item.stockGudang > 0 || item.stockEtalase > 0)
          .map((item) => (
            <div key={item._id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-bold">{item.name}</h2>
              <p className="mt-2 text-sm">Stok Gudang: {item.stockGudang}</p>
              <p className="text-sm">Stok Etalase: {item.stockEtalase}</p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    setEditItem(item);
                    setEditName(item.name);
                    setSelectedGerai(item.asal);
                  }}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Hapus
                </button>
              </div>

              {/* Mutasi & Penjualan */}
              <MutasiForm item={item} onActivitySuccess={onActivitySuccess} />
              <PenjualanForm
                item={item}
                onActivitySuccess={onActivitySuccess}
              />
            </div>
          ))}
        {items.length === 0 && (
          <p className="text-center text-gray-500 col-span-full">
            Tidak ada obat ditemukan.
          </p>
        )}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white p-6 rounded shadow w-96"
          >
            <h2 className="text-lg font-bold mb-4">Edit Item</h2>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full border px-2 py-1 rounded mb-2"
              placeholder="Nama Barang"
              required
            />
            <input
              type="number"
              min="0"
              value={addStockGudang}
              onChange={(e) => setAddStockGudang(parseInt(e.target.value) || 0)}
              className="w-full border px-2 py-1 rounded mb-2"
              placeholder="Tambah stok gudang"
            />
            <select
              id="gerai"
              name="gerai"
              value={selectedGerai}
              className="w-full border p-2"
              onChange={(e) => setSelectedGerai(e.target.value)}
            >
              {geraiList.map((item) => (
                <option value={item.gerai} key={item.no}>
                  {item.gerai}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 py-4">
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="bg-gray-400 px-3 py-1 rounded text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-600 px-3 py-1 rounded text-white"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2 items-center overflow-x-auto max-w-full px-2 scrollbar-hide">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded whitespace-nowrap disabled:opacity-50"
            >
              ← Prev
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index + 1)}
                className={`px-3 py-1 border rounded whitespace-nowrap ${currentPage === index + 1 ? "bg-blue-500 text-white" : ""}`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded whitespace-nowrap disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
