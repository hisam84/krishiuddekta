"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ShippingClassItem {
  id: string;
  name: string;
  slug: string;
  cost: number;
  description: string;
}

export default function AdminShippingPage() {
  const [shippingClasses, setShippingClasses] = useState<ShippingClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ShippingClassItem | null>(null);

  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchShippingClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shipping");
      const data = await res.json();
      if (data.success) {
        setShippingClasses(data.shippingClasses || []);
      }
    } catch (err) {
      toast.error("Failed to load shipping classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingClasses();
  }, []);

  const resetForm = () => {
    setEditingClass(null);
    setName("");
    setCost("");
    setDescription("");
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || cost === "") {
      toast.error("Class name and delivery fee cost are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, cost: Number(cost), description }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Shipping class added successfully!");
        setShowModal(false);
        resetForm();
        fetchShippingClasses();
      } else {
        toast.error(data.message || "Failed to add shipping class");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sc: ShippingClassItem) => {
    setEditingClass(sc);
    setName(sc.name);
    setCost(String(sc.cost));
    setDescription(sc.description || "");
    setShowModal(true);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !name.trim() || cost === "") {
      toast.error("Class name and cost are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingClass.id,
          name,
          cost: Number(cost),
          description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Shipping class updated successfully!");
        setShowModal(false);
        resetForm();
        fetchShippingClasses();
      } else {
        toast.error(data.message || "Failed to update shipping class");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, scName: string) => {
    if (!confirm(`Are you sure you want to delete shipping class "${scName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/shipping?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Shipping class deleted successfully");
        fetchShippingClasses();
      } else {
        toast.error("Failed to delete shipping class");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-300 pb-3 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-[#1d2327] dark:text-white">
            Shipping Classes (WooCommerce Style)
          </h1>
          <p className="text-xs text-neutral-500">
            Define shipping classes and connect delivery charges dynamically to products
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="rounded border border-[#2271b1] bg-[#2271b1] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#135e96] cursor-pointer"
        >
          + Add Shipping Class
        </button>
      </div>

      {loading ? (
        <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs text-neutral-500 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          Loading shipping classes from database...
        </div>
      ) : shippingClasses.length === 0 ? (
        <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-300">No shipping classes found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-neutral-300 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
            <thead className="border-b border-neutral-300 bg-[#f6f7f7] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              <tr>
                <th className="px-4 py-3">Shipping Class Name</th>
                <th className="px-4 py-3">Slug Identifier</th>
                <th className="px-4 py-3">Delivery Charge Fee</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {shippingClasses.map((sc) => (
                <tr key={sc.id} className="hover:bg-[#f6f7f7]/60 dark:hover:bg-neutral-800/40">
                  <td className="px-4 py-3 font-bold text-[#2271b1] dark:text-blue-400">
                    {sc.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-500">
                    {sc.slug}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    BDT {Number(sc.cost).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                    {sc.description || "Default delivery charge"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleEdit(sc)}
                        className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 transition hover:bg-blue-600 hover:text-white dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(sc.id, sc.name)}
                        className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 transition hover:bg-rose-600 hover:text-white dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Shipping Class Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-lg border border-neutral-300 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#101517]">
            <div className="mb-4 flex items-center justify-between border-b pb-2 dark:border-neutral-800">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {editingClass ? "Edit Shipping Class" : "Add Shipping Class"}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-neutral-500 font-bold hover:text-rose-600 dark:text-neutral-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingClass ? handleUpdateClass : handleAddClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Delivery / Heavy Machinery"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white p-2.5 font-bold text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  Delivery Charge Cost (in BDT) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 60 or 250"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white p-2.5 font-mono font-bold text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Standard nationwide delivery fee for small items..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white p-2.5 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="border-t pt-3 flex gap-2 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="w-1/2 rounded border border-neutral-300 py-2 font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 rounded border border-[#2271b1] bg-[#2271b1] py-2 font-bold text-white shadow transition hover:bg-[#135e96] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : (editingClass ? "Update Class" : "Add Class")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
