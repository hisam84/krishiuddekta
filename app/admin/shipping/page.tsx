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
  baseCost: number;
  calculationType: "per_order" | "per_class";
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
  const [baseCost, setBaseCost] = useState("0");
  const [calculationType, setCalculationType] = useState<"per_order" | "per_class">("per_order");
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
        toast.success(`Shipping class ${isEdit ? "updated" : "added"} successfully`);
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
    setBaseCost("0");
    setCalculationType("per_order");
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
    setBaseCost(String(sm.baseCost ?? 0));
    setCalculationType(sm.calculationType || "per_order");
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
          base_cost: Number(baseCost) || 0,
          calculation_type: calculationType,
          class_costs: methodCosts,
          is_active: methodActive,
          description: methodDescription,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Shipping method ${isEdit ? "updated" : "added"} successfully`);
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Shipping & Logistics Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage product weight classes, location-based methods, and delivery fee calculation rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "classes" ? (
            <button
              onClick={() => { resetClassForm(); setShowClassModal(true); }}
              className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
            >
              Add Shipping Class
            </button>
          ) : (
            <button
              onClick={() => { resetMethodForm(); setShowMethodModal(true); }}
              className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
            >
              Add Shipping Method
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-medium">
        <button
          onClick={() => setActiveTab("methods")}
          className={`px-4 py-2.5 border-b-2 cursor-pointer transition ${
            activeTab === "methods"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Shipping Methods
        </button>
        <button
          onClick={() => setActiveTab("classes")}
          className={`px-4 py-2.5 border-b-2 cursor-pointer transition ${
            activeTab === "classes"
              ? "border-emerald-600 text-emerald-700 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Shipping Classes
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-xs">
          Loading configuration data...
        </div>
      ) : activeTab === "classes" ? (
        /* ================= TAB 1: SHIPPING CLASSES ================= */
        shippingClasses.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-xs">
            No shipping classes found.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3">Class Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Base Rate</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shippingClasses.map((sc) => (
                  <tr key={sc.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {sc.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {sc.slug}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                      BDT {Number(sc.cost).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {sc.description || "Default class rate"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClass(sc)}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClass(sc.id, sc.name)}
                          className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100 transition cursor-pointer"
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
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-xs">
            No shipping methods found.
          </div>
        ) : (
          <div className="space-y-4">
            {shippingMethods.map((sm) => (
              <div
                key={sm.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {sm.name}
                      </h3>
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                        {sm.locationType === "dhaka" ? "Dhaka City" : "Outside Dhaka"}
                      </span>
                      <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                        {sm.calculationType === "per_class" ? "Cumulative Class Rates" : "Highest Class Rate"}
                      </span>
                    </div>
                    {sm.description && (
                      <p className="mt-1 text-xs text-slate-500">{sm.description}</p>
                    )}
                    <p className="mt-1.5 text-xs text-slate-600">
                      Base Fee: <span className="font-mono text-slate-900 font-semibold">BDT {Number(sm.baseCost || 0).toFixed(2)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditMethod(sm)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Configure Class Rates
                    </button>
                    <button
                      onClick={() => handleDeleteMethod(sm.id, sm.name)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Per-Class Rates Table */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="pb-2 pt-1 px-1">Shipping Class</th>
                        <th className="pb-2 pt-1 px-1 text-right">Delivery Charge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {shippingClasses.map((sc) => {
                        const fee = sm.classCosts?.[sc.id] ?? sc.cost;
                        return (
                          <tr key={sc.id}>
                            <td className="py-2 px-1 font-medium text-slate-800">
                              {sc.name} <span className="text-slate-400 font-normal">({sc.description || "Weight class"})</span>
                            </td>
                            <td className="py-2 px-1 text-right font-mono font-bold text-emerald-700">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                {editingClass ? "Edit Shipping Class" : "Add Shipping Class"}
              </h2>
              <button
                onClick={() => { setShowClassModal(false); resetClassForm(); }}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Class Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Light / Standard (0 - 1 kg)"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Base Delivery Charge (BDT)
                </label>
                <input
                  type="number"
                  required
                  placeholder="60"
                  value={classCost}
                  onChange={(e) => setClassCost(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 font-mono text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Weight range or class details"
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowClassModal(false); resetClassForm(); }}
                  className="w-1/2 rounded-lg border border-slate-200 py-2 font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 rounded-lg bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                {editingMethod ? "Configure Shipping Method" : "Add New Shipping Method"}
              </h2>
              <button
                onClick={() => { setShowMethodModal(false); resetMethodForm(); }}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMethod} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Shipping Method Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Inside Dhaka City"
                  value={methodName}
                  onChange={(e) => setMethodName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">
                    Target Location Zone
                  </label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="dhaka">Inside Dhaka City</option>
                    <option value="outside_dhaka">Outside Dhaka / District</option>
                    <option value="custom">Custom Location Option</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">
                    Base Shipping Fee (BDT)
                  </label>
                  <input
                    type="number"
                    value={baseCost}
                    onChange={(e) => setBaseCost(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 font-mono text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Delivery Fee Calculation Rule */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                <label className="block font-semibold text-slate-800 mb-1">
                  Delivery Fee Calculation Rule
                </label>
                
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="calcType"
                    value="per_order"
                    checked={calculationType === "per_order"}
                    onChange={() => setCalculationType("per_order")}
                    className="mt-0.5 accent-emerald-600 cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">
                      Highest Shipping Class Fee
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Applies fee for the most expensive item class in cart.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="calcType"
                    value="per_class"
                    checked={calculationType === "per_class"}
                    onChange={() => setCalculationType("per_class")}
                    className="mt-0.5 accent-emerald-600 cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">
                      Sum of All Shipping Class Fees
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Combines individual shipping fees for every class present in cart.
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Delivery notes or zone details"
                  value={methodDescription}
                  onChange={(e) => setMethodDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Specific Delivery Fees per Shipping Class */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-3">
                <label className="block font-semibold text-slate-800">
                  Shipping Class Rates for Location
                </label>
                <div className="space-y-2.5">
                  {shippingClasses.map((sc) => (
                    <div key={sc.id} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-800">{sc.name}</p>
                        <p className="text-[10px] text-slate-500">{sc.description || "Weight class"}</p>
                      </div>
                      <div className="flex items-center gap-1.5 w-32">
                        <span className="text-slate-500 text-[11px]">BDT</span>
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
                          className="w-full rounded-md border border-slate-300 bg-white p-1.5 font-mono font-bold text-emerald-700 text-right focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowMethodModal(false); resetMethodForm(); }}
                  className="w-1/2 rounded-lg border border-slate-200 py-2 font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 rounded-lg bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
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
