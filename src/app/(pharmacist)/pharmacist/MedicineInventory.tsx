"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ResponsiveContainer from "@/components/ui/ResponsiveContainer";
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  X,
} from "lucide-react";

interface Medicine {
  id: number;
  name: string;
  brand: string | null;
  category: string | null;
  expiry_date: string | null;
  quantity: number;
  cost: number | null;
  tax: number | null;
  total_cost: number | null;
}

const PAGE_LIMIT = 20;
const API_ROOT = process.env.NEXT_PUBLIC_BACKEND_URL || "";

const MedicineInventory: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const [newMedicine, setNewMedicine] = useState<Omit<Medicine, "id">>({
    name: "",
    brand: "",
    category: "",
    expiry_date: null,
    quantity: 0,
    cost: 0,
    tax: 0,
    total_cost: 0,
  });

  const observerMobile = useRef<IntersectionObserver | null>(null);
  const observerDesktop = useRef<IntersectionObserver | null>(null);
  const fetchingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildParams = useCallback(
    (p: number) => {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", String(PAGE_LIMIT));
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (filterBrand !== "all") params.set("brand", filterBrand);
      if (filterCategory !== "all") params.set("category", filterCategory);
      return params.toString();
    },
    [searchTerm, filterBrand, filterCategory]
  );

  const fetchPage = useCallback(
    async (p: number, reset = false) => {
      if (fetchingRef.current) return;
      if (!reset && !hasMore) return;

      try {
        fetchingRef.current = true;
        if (reset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const params = buildParams(p);
        const res = await fetch(`${API_ROOT}/medicines/?${params}`);
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || "Failed to fetch inventory");
        }
        const json = await res.json();

        const items: Medicine[] = Array.isArray(json.data) ? json.data : json.data || [];

        if (reset) {
          setMedicines(items);
          setPage(1);
        } else {
          setMedicines((prev) => {
            const map = new Map<number, Medicine>();
            prev.forEach((m) => map.set(m.id, m));
            items.forEach((m) => map.set(m.id, m));
            return Array.from(map.values());
          });
        }

        setBrands((prev) => {
          const s = new Set(prev);
          items.forEach((m) => m.brand && s.add(m.brand));
          return Array.from(s);
        });

        setCategories((prev) => {
          const s = new Set(prev);
          items.forEach((m) => m.category && s.add(m.category));
          return Array.from(s);
        });

        setHasMore(Boolean(json.has_more));
      } catch (err) {
        console.error("Fetch inventory error:", err);
      } finally {
        fetchingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [API_ROOT, buildParams, hasMore]
  );

  useEffect(() => {
    fetchPage(1, true);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      observerMobile.current?.disconnect();
      observerDesktop.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setMedicines([]);
      setHasMore(true);
      setPage(1);
      fetchPage(1, true);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterBrand, filterCategory]);

  useEffect(() => {
    if (page === 1) return;
    if (!hasMore) return;
    fetchPage(page, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const setLastMobileElement = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerMobile.current) {
        observerMobile.current.disconnect();
      }
      if (!node || !hasMore) return;

      observerMobile.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
            setPage((p) => p + 1);
          }
        },
        { rootMargin: "300px" }
      );

      observerMobile.current.observe(node);
    },
    [hasMore, loading, loadingMore]
  );

  const setLastDesktopElement = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (observerDesktop.current) {
        observerDesktop.current.disconnect();
      }
      if (!node || !hasMore) return;

      observerDesktop.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
            setPage((p) => p + 1);
          }
        },
        { rootMargin: "300px" }
      );

      observerDesktop.current.observe(node);
    },
    [hasMore, loading, loadingMore]
  );

  const getSerial = (index: number) => index + 1;

  const getStockStatus = (quantity: number) => {
    if (quantity <= 10) return { color: "text-red-600 bg-red-100", label: "Critical" };
    if (quantity <= 50) return { color: "text-yellow-600 bg-yellow-100", label: "Low" };
    return { color: "text-green-600 bg-green-100", label: "Good" };
  };

  const parseISO = (s: string | null) => (s ? new Date(s) : null);
  const daysUntil = (iso: string | null) => {
    const d = parseISO(iso);
    if (!d) return null;
    const diff = Math.floor((d.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };
  const expiryBadge = (iso: string | null) => {
    const days = daysUntil(iso);
    if (days === null) return null;
    if (days < 0) return { label: "Expired", tone: "red" };
    if (days <= 90) return { label: `Expiring in ${days}d`, tone: "yellow" };
    return null;
  };

  const handleDownloadInventory = async () => {
    try {
      const res = await fetch(`${API_ROOT}/medicines/download`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "medicine-inventory.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download inventory.");
    }
  };

  const handleAddMedicine = async () => {
    try {
      const body = {
        ...newMedicine,
        brand: newMedicine.brand || null,
        category: newMedicine.category || null,
        expiry_date: newMedicine.expiry_date || null,
      };
      const res = await fetch(`${API_ROOT}/medicines/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Add failed");
      }
      const json = await res.json();
      setMedicines((prev) => [json, ...prev]);
      if (json.brand) setBrands((prev) => Array.from(new Set([...prev, json.brand])));
      if (json.category) setCategories((prev) => Array.from(new Set([...prev, json.category])));
      setShowAddModal(false);
      setNewMedicine({ name: "", brand: "", category: "", expiry_date: null, quantity: 0, cost: 0, tax: 0, total_cost: 0 });
    } catch (err) {
      console.error("Add medicine error:", err);
      alert("Failed to add medicine.");
    }
  };

  const handleEditMedicine = async () => {
    if (!selectedMedicine) return;
    try {
      const payload = {
        ...selectedMedicine,
        brand: selectedMedicine.brand || null,
        category: selectedMedicine.category || null,
        expiry_date: selectedMedicine.expiry_date || null,
      };
      const res = await fetch(`${API_ROOT}/medicines/${selectedMedicine.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Update failed");
      }
      const json = await res.json();
      setMedicines((prev) => prev.map((m) => (m.id === json.id ? json : m)));
      if (json.brand) setBrands((prev) => Array.from(new Set([...prev, json.brand])));
      if (json.category) setCategories((prev) => Array.from(new Set([...prev, json.category])));
      setShowEditModal(false);
      setSelectedMedicine(null);
    } catch (err) {
      console.error("Edit medicine error:", err);
      alert("Failed to update medicine.");
    }
  };

  const handleDeleteMedicine = async (id: number) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;
    try {
      const res = await fetch(`${API_ROOT}/medicines/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setMedicines((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete medicine.");
    }
  };

  if (loading && medicines.length === 0) {
    return <div className="text-center py-20 text-gray-600">Loading Medicines...</div>;
  }

  return (
    <ResponsiveContainer className="w-full max-w-full px-2 sm:px-6 py-4 sm:py-8 mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-full">
        <div className="p-2 sm:p-6 border-b border-gray-200 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center w-full">
          <div className="w-full min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center mb-1">
              <Package className="w-6 h-6 mr-2 text-purple-600" />
              <span className="truncate">Medicine Inventory</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Manage and monitor your medicine stock.</p>
          </div>
          <div className="w-full flex flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3 sm:justify-end min-w-0">
            <button
              onClick={handleDownloadInventory}
              className="flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4 mr-2" /> Download Excel
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Medicine
            </button>
          </div>
        </div>

        <div className="p-2 sm:p-6 bg-gray-50 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Medicines</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Brand</label>
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-2 sm:p-6 w-full">
          {medicines.length === 0 ? (
            <div className="text-center text-gray-600 py-8">No medicines found.</div>
          ) : (
            <>
              <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:hidden w-full">
                {medicines.map((med, idx) => {
                  const stock = getStockStatus(med.quantity);
                  const isLast = idx === medicines.length - 1;
                  const badge = expiryBadge(med.expiry_date);
                  return (
                    <div
                      key={med.id}
                      ref={isLast ? setLastMobileElement : undefined}
                      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex flex-col justify-between w-full"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <div className="font-medium text-gray-900">{med.name}</div>
                              {badge && (
                                <span
                                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                    badge.tone === "red" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {badge.label}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1 truncate">
                              {med.brand || "—"} {med.category ? ` • ${med.category}` : ""}
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${stock.color}`}>
                              {stock.label}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-gray-700 space-y-1">
                          <div>Quantity: <span className="font-medium">{med.quantity} units</span></div>
                          <div>Cost: <span className="font-medium">₹{med.cost ?? 0}</span></div>
                          <div>Total: <span className="font-medium">₹{med.total_cost ?? 0}</span></div>
                          <div className="text-xs text-gray-500">Expiry: {med.expiry_date ? new Date(med.expiry_date).toLocaleDateString() : "—"}</div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setSelectedMedicine(med); setShowEditModal(true); }}
                          className="flex items-center px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md text-sm"
                        >
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMedicine(med.id)}
                          className="flex items-center px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-md text-sm"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden lg:block overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">S.No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Medicine</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Brand</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Expiry</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Cost (₹)</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Total Cost (₹)</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {medicines.map((med, idx) => {
                      const stock = getStockStatus(med.quantity);
                      const isLast = idx === medicines.length - 1;
                      const badge = expiryBadge(med.expiry_date);
                      return (
                        <tr key={med.id} ref={isLast ? setLastDesktopElement : undefined}>
                          <td className="px-6 py-4">{getSerial(idx)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="font-medium text-gray-900">{med.name}</div>
                              {badge && (
                                <span
                                  className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                                    badge.tone === "red" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {badge.label}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">{med.brand || "—"}</td>
                          <td className="px-6 py-4">{med.category || "—"}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${stock.color}`}>
                              {med.quantity} units
                            </span>
                          </td>
                          <td className="px-6 py-4">{med.expiry_date ? new Date(med.expiry_date).toLocaleDateString() : "—"}</td>
                          <td className="px-6 py-4">{med.cost ?? 0}</td>
                          <td className="px-6 py-4">{med.total_cost ?? 0}</td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button onClick={() => { setSelectedMedicine(med); setShowEditModal(true); }} className="text-purple-600 hover:text-purple-900">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteMedicine(med.id)} className="text-red-600 hover:text-red-900">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="p-4 text-center">
          {loadingMore && <span className="text-gray-600">Loading more...</span>}
          {!hasMore && !loading && medicines.length > 0 && <span className="text-gray-500">No more items</span>}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Medicine</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-6 h-6 text-gray-500" /></button>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input value={newMedicine.name} onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>

            <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Brand</label>
                <input value={newMedicine.brand ?? ""} onChange={(e) => setNewMedicine({ ...newMedicine, brand: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input value={newMedicine.category ?? ""} onChange={(e) => setNewMedicine({ ...newMedicine, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                <input type="date" value={newMedicine.expiry_date ?? ""} onChange={(e) => setNewMedicine({ ...newMedicine, expiry_date: e.target.value || null })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input type="number" value={newMedicine.quantity} onChange={(e) => setNewMedicine({ ...newMedicine, quantity: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cost</label>
                <input type="number" value={newMedicine.cost ?? 0} onChange={(e) => setNewMedicine({ ...newMedicine, cost: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tax</label>
                <input type="number" value={newMedicine.tax ?? 0} onChange={(e) => setNewMedicine({ ...newMedicine, tax: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <button onClick={handleAddMedicine} className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Save Medicine</button>
          </div>
        </div>
      )}

      {showEditModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Medicine</h3>
              <button onClick={() => { setShowEditModal(false); setSelectedMedicine(null); }}><X className="w-6 h-6 text-gray-500" /></button>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input value={selectedMedicine.name} onChange={(e) => setSelectedMedicine({ ...selectedMedicine, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>

            <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Brand</label>
                <input value={selectedMedicine.brand ?? ""} onChange={(e) => setSelectedMedicine({ ...selectedMedicine, brand: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input value={selectedMedicine.category ?? ""} onChange={(e) => setSelectedMedicine({ ...selectedMedicine, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                <input type="date" value={selectedMedicine.expiry_date ?? ""} onChange={(e) => setSelectedMedicine({ ...selectedMedicine, expiry_date: e.target.value || null })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input type="number" value={selectedMedicine.quantity} onChange={(e) => setSelectedMedicine({ ...selectedMedicine, quantity: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cost</label>
                <input type="number" value={selectedMedicine.cost ?? 0} onChange={(e) => setSelectedMedicine({ ...selectedMedicine, cost: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tax</label>
                <input type="number" value={selectedMedicine.tax ?? 0} onChange={(e) => setSelectedMedicine({ ...selectedMedicine, tax: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <button onClick={handleEditMedicine} className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Save Changes</button>
          </div>
        </div>
      )}
    </ResponsiveContainer>
  );
};

export default MedicineInventory;