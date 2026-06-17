import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

export default function LogList({ refreshKey, onActivitySuccess }) {
  const [logs, setLogs] = useState([]);
  const [tanggal, setTanggal] = useState(dayjs().format("YYYY-MM-DD"));
  const [jenis, setJenis] = useState("all");
  const [loading, setLoading] = useState(false);

  const [editLog, setEditLog] = useState(null);
  const [editJumlah, setEditJumlah] = useState(0);
  const [editType, setEditType] = useState("input");

  // 🔎 Tambah state untuk search
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Ambil role dan token
  const userRole = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  // Konfigurasi Header
  const authHeaders = {
    Authorization: `Bearer ${token}`
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/logs`,
        { 
          params: { date: tanggal, type: jenis },
          headers: authHeaders // 🔹 Sisipkan token
        }
      );
      setLogs(Array.isArray(res.data) ? res.data : res.data.logs || []);
    } catch (err) {
      console.error("Gagal mengambil data log:", err);
      setLogs([]);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [refreshKey, tanggal, jenis]);

  // 🔹 Perbaikan Export: Menggunakan Axios blob agar bisa mengirim token Auth
  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/logs/export?date=${tanggal}&type=${jenis}`,
        { 
          headers: authHeaders,
          responseType: "blob" // Penting untuk file biner (Excel)
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `log-${tanggal}-${jenis}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Gagal export log:", err);
      alert("Gagal mengunduh file Excel.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLogs = async () => {
    if (!window.confirm(`Hapus semua log tanggal ${tanggal}?`)) return;

    setLoading(true);
    try {
      await axios.delete("http://localhost:5000/api/logs", {
        data: { date: tanggal },
        headers: authHeaders // 🔹 Sisipkan token
      });
      await fetchLogs();
      onActivitySuccess?.();
    } catch (err) {
      alert(err.response?.data?.error || "Gagal menghapus log");
      console.error(err);
    }
    setLoading(false);
  };

  const handleDeleteLog = async (id) => {
    if (!confirm("Yakin ingin menghapus log ini? Stok akan dikembalikan."))
      return;
    try {
      await axios.delete(`http://localhost:5000/api/logs/${id}`, {
        headers: authHeaders // 🔹 Sisipkan token
      });
      await fetchLogs();
      onActivitySuccess?.();
    } catch (err) {
      console.error("Gagal menghapus log:", err);
      alert(err.response?.data?.error || "Terjadi kesalahan saat menghapus log.");
    }
  };

  const openEditModal = (log) => {
    setEditLog(log);
    setEditJumlah(log.jumlah);
    setEditType(log.type);
  };

  const handleUpdateLog = async () => {
    if (!editLog) return;

    try {
      await axios.put(
        `http://localhost:5000/api/logs/${editLog._id}`,
        {
          itemId: editLog.itemId,
          itemName: editLog.itemName,
          type: editType,
          jumlah: Number(editJumlah),
        },
        { headers: authHeaders } // 🔹 Sisipkan token
      );

      setEditLog(null);
      await fetchLogs();
      onActivitySuccess?.();
    } catch (err) {
      console.error("Gagal mengupdate log:", err);
      alert(err.response?.data?.error || "Terjadi kesalahan saat mengedit log.");
    }
  };

  // 🔎 Filter logs sesuai searchTerm
  const filteredLogs = logs.filter((log) =>
    log.itemName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-2 sm:p-4">
      {/* Filter dan aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        {/* Kiri: filter + export */}
        <div className="flex flex-wrap items-center gap-2">
          <div>
            <label className="mr-2 text-sm">Tanggal:</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="border px-2 py-1 rounded text-sm"
            />
          </div>

          <div>
            <label className="mr-2 text-sm">Jenis Log:</label>
            <select
              value={jenis}
              onChange={(e) => setJenis(e.target.value)}
              className="border px-2 py-1 rounded text-sm"
            >
              <option value="all">Semua</option>
              {/* Jika user biasa (staff), mungkin opsinya perlu dibatasi juga, tapi kita asumsikan ini bisa dilihat semua */}
              <option value="input">Input</option>
              <option value="mutasi">Mutasi</option>
              <option value="penjualan">Penjualan</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          {/* 🔹 HANYA ADMIN YANG BISA EXPORT */}
          {userRole === 'admin' && (
            <button
              onClick={handleExport}
              disabled={loading}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              {loading ? "Mengekspor..." : "Export Excel"}
            </button>
          )}
        </div>

        {/* 🔹 HANYA ADMIN YANG BISA HAPUS LOG HARIAN */}
        {userRole === 'admin' && (
          <button
            onClick={handleDeleteLogs}
            disabled={loading}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 w-full sm:w-auto disabled:opacity-50"
          >
            {loading ? "Menghapus..." : "Hapus Log Tanggal Ini"}
          </button>
        )}
      </div>

      {/* 🔎 Input pencarian */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama obat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border px-3 py-2 rounded text-sm"
        />
      </div>

      {/* Tabel log - tampil hanya di layar >= sm */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm border rounded-lg overflow-hidden bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Waktu</th>
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-left">Jenis</th>
              <th className="p-2 text-left">Asal</th>
              <th className="p-2 text-left">Tujuan</th>
              <th className="p-2 text-left">Jumlah</th>
              {/* 🔹 HANYA ADMIN YANG MELIHAT HEADER AKSI */}
              {userRole === 'admin' && <th className="p-2 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={userRole === 'admin' ? "7" : "6"} className="text-center p-4 text-gray-500">
                  Tidak ada log
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log._id} className="border-t hover:bg-gray-50">
                  <td className="p-2 whitespace-nowrap">
                    {dayjs(log.createdAt).format("YYYY-MM-DD HH:mm")}
                  </td>
                  <td className="p-2 font-medium">{log.itemName}</td>
                  <td className="p-2 capitalize">{log.type}</td>
                  <td className="p-2 capitalize">{log.asal || "-"}</td>
                  <td className="p-2 capitalize">{log.tujuan || "-"}</td>
                  <td className="p-2 font-semibold text-center">{log.jumlah}</td>
                  
                  {/* 🔹 HANYA ADMIN YANG MELIHAT TOMBOL EDIT & HAPUS */}
                  {userRole === 'admin' && (
                    <td className="p-2 flex gap-2 justify-center">
                      <button
                        onClick={() => openEditModal(log)}
                        className="text-blue-600 hover:underline hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLog(log._id)}
                        className="text-red-600 hover:underline hover:text-red-800"
                      >
                        Hapus
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="sm:hidden space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-gray-500 py-4 bg-white rounded shadow-sm">Tidak ada log</div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log._id}
              className="bg-white border rounded-lg p-3 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 font-medium">
                  {dayjs(log.createdAt).format("HH:mm, DD MMM YYYY")}
                </span>
                <span className="capitalize text-sm font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                  {log.type}
                </span>
              </div>
              <div className="mb-2">
                <p className="font-bold text-lg">{log.itemName}</p>
                <div className="text-sm text-gray-600 mt-1 flex justify-between">
                  <span>Asal: {log.asal || "-"}</span>
                  <span>Tujuan: {log.tujuan || "-"}</span>
                </div>
                <p className="text-sm text-gray-800 font-semibold mt-1">Jumlah: {log.jumlah}</p>
              </div>
              
              {/* 🔹 HANYA ADMIN YANG MELIHAT TOMBOL EDIT & HAPUS DI MOBILE */}
              {userRole === 'admin' && (
                <div className="flex gap-3 mt-3 border-t pt-3">
                  <button
                    onClick={() => openEditModal(log)}
                    className="flex-1 bg-blue-100 text-blue-700 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLog(log._id)}
                    className="flex-1 bg-red-100 text-red-700 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-200"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Edit (Secara teknis hanya bisa dibuka admin karena tombol tersembunyi untuk staff) */}
      {editLog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Edit Log: {editLog.itemName}</h2>
            <div className="mb-4">
              <label className="block mb-1 font-semibold text-gray-700">Jumlah Aktual:</label>
              <input
                type="number"
                value={editJumlah}
                onChange={(e) => setEditJumlah(e.target.value)}
                className="border px-3 py-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditLog(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100 text-gray-700 font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateLog}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}