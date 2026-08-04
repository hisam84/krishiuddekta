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

interface ShippingMethodItem {
  id: string;
  name: string;
  locationType: "dhaka" | "outside_dhaka" | "custom";
  classCosts: Record<string, number>;
  isActive: boolean;
  description: string;
}

export default function AdminShippingPage() {
  const [activeTab, setActiveTab] = useState<"classes" | "methods">("methods");

  const [shippingClasses, setShippingClasses] = useState<ShippingClassItem[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethodItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Class Modal State
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ShippingClassItem | null>(null);
  const [className, setClassName] = useState("");
  const [classCost, setClassCost] = useState("");
  const [classDescription, setClassDescription] = useState("");

  // Method Modal State
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethodItem | null>(null);
  const [methodName, setMethodName] = useState("");
  const [locationType, setLocationType] = useState<"dhaka" | "outside_dhaka" | "custom">("dhaka");
  const [methodCosts, setMethodCosts] = useState<Record<string, number>>({});
  const [methodDescription, setMethodDescription] = useState("");
  const [methodActive, setMethodActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const fetchShippingData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shipping");
      const data = await res.json();
      if (data.success) {
        setShippingClasses(data.shippingClasses || []);
        setShippingMethods(data.shippingMethods || []);
      }
    } catch (err) {
      toast.error("Failed to load shipping data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingData();
  }, []);

  // Shipping Class Form Handlers
  const resetClassForm = () => {
    setEditingClass(null);
    setClassName("");
    setClassCost("");
    setClassDescription("");
  };

  const handleEditClass = (sc: ShippingClassItem) => {
    setEditingClass(sc);
    setClassName(sc.name);
    setClassCost(String(sc.cost));
    setClassDescription(sc.description || "");
    setShowClassModal(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim() || classCost === "") {
      toast.error("Class name and base cost are required");
      return;
    }

    setSubmitting(true);
    try {
      const isEdit = Boolean(editingClass);
      const res = await fetch("/api/admin/shipping", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingClass?.id,
          target_type: "class",
          name: className,
          cost: Number(classCost),
          description: classDescription,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Shipping class ${isEdit ? "updated" : "added"} successfully!`);
        setShowClassModal(false);
        resetClassForm();
        fetchShippingData();
      } else {
        toast.error(data.message || "Failed to save shipping class");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async (id: string, scName: string) => {
    if (!confirm(`Are you sure you want to delete shipping class "${scName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/shipping?id=${id}&type=class`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Shipping class deleted successfully");
        fetchShippingData();
      } else {
        toast.error("Failed to delete shipping class");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  // Shipping Method Form Handlers
  const resetMethodForm = () => {
    setEditingMethod(null);
    setMethodName("");
    setLocationType("dhaka");
    const initialCosts: Record<string, number> = {};
    shippingClasses.forEach((sc) => {
      initialCosts[sc.id] = sc.cost;
    });
    setMethodCosts(initialCosts);
    setMethodDescription("");
    setMethodActive(true);
  };

  const handleEditMethod = (sm: ShippingMethodItem) => {
    setEditingMethod(sm);
    setMethodName(sm.name);
    setLocationType(sm.locationType || "dhaka");
    const mergedCosts = { ...sm.classCosts };
    shippingClasses.forEach((sc) => {
      if (mergedCosts[sc.id] === undefined) {
        mergedCosts[sc.id] = sc.cost;
      }
    });
    setMethodCosts(mergedCosts);
    setMethodDescription(sm.description || "");
    setMethodActive(sm.isActive);
    setShowMethodModal(true);
  };

  const handleSaveMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodName.trim()) {
      toast.error("Shipping method name is required");
      return;
    }

    setSubmitting(true);
    try {
      const isEdit = Boolean(editingMethod);
      const res = await fetch("/api/admin/shipping", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingMethod?.id,
          target_type: "method",
          name: methodName,
          location_type: locationType,
          class_costs: methodCosts,
          is_active: methodActive,
          description: methodDescription,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Shipping method ${isEdit ? "updated" : "added"} successfully!`);
        setShowMethodModal(false);
        resetMethodForm();
        fetchShippingData();
      } else {
        toast.error(data.message || "Failed to save shipping method");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMethod = async (id: string, smName: string) => {
    if (!confirm(`Are you sure you want to delete shipping method "${smName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/shipping?id=${id}&type=method`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Shipping method deleted successfully");
        fetchShippingData();
      } else {
        toast.error("Failed to delete shipping method");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-300 pb-3 gap-3 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-[#1d2327] dark:text-white">
            Shipping & Delivery Management
          </h1>
          <p className="text-xs text-neutral-500">
            Define weight-based product Shipping Classes & location-based Shipping Methods with custom per-class rates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "classes" ? (
            <button
              onClick={() => { resetClassForm(); setShowClassModal(true); }}
              className="rounded border border-[#2271b1] bg-[#2271b1] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#135e96] cursor-pointer"
            >
              + Add Shipping Class
            </button>
          ) : (
            <button
              onClick={() => { resetMethodForm(); setShowMethodModal(true); }}
              className="rounded border border-[#2271b1] bg-[#2271b1] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#135e96] cursor-pointer"
            >
              + Add Shipping Method
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-300 dark:border-neutral-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab("methods")}
          className={`px-4 py-2.5 border-b-2 cursor-pointer transition ${
            activeTab === "methods"
              ? "border-[#2271b1] text-[#2271b1] dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          🚚 Shipping Methods (লোকেশন ভিত্তিক মেথড)
        </button>
        <button
          onClick={() => setActiveTab("classes")}
          className={`px-4 py-2.5 border-b-2 cursor-pointer transition ${
            activeTab === "classes"
              ? "border-[#2271b1] text-[#2271b1] dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          📦 Shipping Classes (ওজন ভিত্তিক ক্লাস)
        </button>
      </div>

      {loading ? (
        <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs text-neutral-500 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          Loading shipping configurations...
        </div>
      ) : activeTab === "classes" ? (
        /* ================= TAB 1: SHIPPING CLASSES ================= */
        shippingClasses.length === 0 ? (
          <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-neutral-600 dark:text-neutral-300">No shipping classes found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded border border-neutral-300 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
              <thead className="border-b border-neutral-300 bg-[#f6f7f7] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                <tr>
                  <th className="px-4 py-3">Shipping Class Name</th>
                  <th className="px-4 py-3">Identifier Slug</th>
                  <th className="px-4 py-3">Base Default Fee</th>
                  <th className="px-4 py-3">Weight / Details</th>
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
                      {sc.description || "Default class rate"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClass(sc)}
                          className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 hover:bg-blue-600 hover:text-white cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClass(sc.id, sc.name)}
                          className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 hover:bg-rose-600 hover:text-white cursor-pointer"
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
        )
      ) : (
        /* ================= TAB 2: SHIPPING METHODS ================= */
        shippingMethods.length === 0 ? (
          <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-neutral-600 dark:text-neutral-300">No shipping methods found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shippingMethods.map((sm) => (
              <div
                key={sm.id}
                className="rounded-lg border border-neutral-300 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {sm.name}
                      </h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        sm.locationType === "dhaka"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {sm.locationType === "dhaka" ? "Dhaka City" : "Outside Dhaka / District"}
                      </span>
                    </div>
                    {sm.description && (
                      <p className="mt-1 text-xs text-neutral-500">{sm.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditMethod(sm)}
                      className="rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white cursor-pointer"
                    >
                      Configure Class Rates
                    </button>
                    <button
                      onClick={() => handleDeleteMethod(sm.id, sm.name)}
                      className="rounded border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Per-Class Rates Table inside Shipping Method */}
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-neutral-100 font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                        <th className="px-3 py-1.5">Shipping Class (Product Weight)</th>
                        <th className="px-3 py-1.5">Delivery Fee for this Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {shippingClasses.map((sc) => {
                        const fee = sm.classCosts?.[sc.id] ?? sc.cost;
                        return (
                          <tr key={sc.id}>
                            <td className="px-3 py-1.5 font-medium text-neutral-800 dark:text-neutral-200">
                              {sc.name} <span className="text-neutral-400">({sc.description || "Weight class"})</span>
                            </td>
                            <td className="px-3 py-1.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              BDT {Number(fee).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ================= MODAL 1: ADD/EDIT SHIPPING CLASS ================= */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-lg border border-neutral-300 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#101517]">
            <div className="mb-4 flex items-center justify-between border-b pb-2 dark:border-neutral-800">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {editingClass ? "Edit Shipping Class" : "Add Shipping Class"}
              </h2>
              <button
                onClick={() => { setShowClassModal(false); resetClassForm(); }}
                className="text-neutral-500 font-bold hover:text-rose-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  Class Name (Product Weight / Type) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Light / Standard (0 - 1 kg)"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white p-2.5 font-bold text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  Base Delivery Charge Cost (in BDT) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="60"
                  value={classCost}
                  onChange={(e) => setClassCost(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white p-2.5 font-mono font-bold text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  Weight Range / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Weight 0 - 1 kg / Small packages"
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white p-2.5 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="border-t pt-3 flex gap-2 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => { setShowClassModal(false); resetClassForm(); }}
                  className="w-1/2 rounded border border-neutral-300 py-2 font-semibold hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 rounded border border-[#2271b1] bg-[#2271b1] py-2 font-bold text-white shadow hover:bg-[#135e96] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : (editingClass ? "Update Class" : "Add Class")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ADD/EDIT SHIPPING METHOD ================= */}
      {showMethodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-lg border border-neutral-300 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#101517] max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between border-b pb-2 dark:border-neutral-800">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {editingMethod ? "Configure Shipping Method & Rates" : "Add New Shipping Method"}
              </h2>
              <button
                onClick={() => { setShowMethodModal(false); resetMethodForm(); }}
                className="text-neutral-500 font-bold hover:text-rose-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMethod} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  Shipping Method Name (Customer Location) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inside Dhaka City (ঢাকা সিটির ভেতরে)"
                  value={methodName}
                  onChange={(e) => setMethodName(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white p-2.5 font-bold text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  Target Location Type *
                </label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value as any)}
                  className="w-full rounded border border-neutral-300 bg-white p-2.5 font-bold text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="dhaka">Inside Dhaka City (ঢাকা শহরের মধ্যে)</option>
                  <option value="outside_dhaka">Outside Dhaka / District (ঢাকার বাইরে / সকল জেলা)</option>
                  <option value="custom">Custom Location Option</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  Method Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delivery fee for Dhaka metropolitan city area"
                  value={methodDescription}
                  onChange={(e) => setMethodDescription(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white p-2.5 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              {/* Specific Delivery Fees per Shipping Class */}
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
                <label className="block font-bold text-[#2271b1] dark:text-blue-400 mb-2">
                  💰 Delivery Charges per Product Shipping Class for this Location:
                </label>
                <div className="space-y-3">
                  {shippingClasses.map((sc) => (
                    <div key={sc.id} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-neutral-900 dark:text-white">{sc.name}</p>
                        <p className="text-[10px] text-neutral-400">{sc.description || "Weight class"}</p>
                      </div>
                      <div className="flex items-center gap-1 w-32">
                        <span className="font-bold text-neutral-500">BDT</span>
                        <input
                          type="number"
                          required
                          value={methodCosts[sc.id] !== undefined ? methodCosts[sc.id] : sc.cost}
                          onChange={(e) =>
                            setMethodCosts({
                              ...methodCosts,
                              [sc.id]: Number(e.target.value),
                            })
                          }
                          className="w-full rounded border border-neutral-300 bg-white p-1.5 font-mono font-bold text-emerald-700 text-right focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-emerald-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 flex gap-2 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => { setShowMethodModal(false); resetMethodForm(); }}
                  className="w-1/2 rounded border border-neutral-300 py-2 font-semibold hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 rounded border border-[#2271b1] bg-[#2271b1] py-2 font-bold text-white shadow hover:bg-[#135e96] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : (editingMethod ? "Update Method" : "Add Method")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
