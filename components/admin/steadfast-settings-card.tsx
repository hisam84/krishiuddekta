"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SteadfastSettingsCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://portal.steadfast.com.bd/api/v1");
  const [enabled, setEnabled] = useState(true);
  const [hasKeysSet, setHasKeysSet] = useState(false);
  const [balance, setBalance] = useState<any>(null);
  const [showKeys, setShowKeys] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/steadfast/settings");
      const data = await res.json();
      if (data.success) {
        setHasKeysSet(data.config.hasApiKey && data.config.hasSecretKey);
        setBaseUrl(data.config.baseUrl || "https://portal.steadfast.com.bd/api/v1");
        setEnabled(data.config.enabled ?? true);
        if (data.balance) {
          setBalance(data.balance);
        }
      }
    } catch (err) {
      toast.error("Failed to load Steadfast settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/steadfast/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
          ...(secretKey.trim() ? { secretKey: secretKey.trim() } : {}),
          baseUrl: baseUrl.trim(),
          enabled,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Steadfast Courier API credentials saved!");
        setApiKey("");
        setSecretKey("");
        fetchSettings();
      } else {
        toast.error(data.message || "Failed to save settings");
      }
    } catch (err) {
      toast.error("Server error while saving Steadfast settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Status Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-black text-lg border border-blue-100">
              SF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Steadfast Courier Integration</h2>
                {hasKeysSet ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                    Not Configured
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automate order placement, consignment creation, and live delivery status tracking with Steadfast Courier BD.
              </p>
            </div>
          </div>

          <button
            onClick={fetchSettings}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer self-start sm:self-auto"
          >
            {loading ? "Checking..." : "Refresh Balance & Status"}
          </button>
        </div>

        {/* Account Balance Banner */}
        {balance && balance.current_balance !== undefined && (
          <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50/60 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-900">Steadfast Account Balance</p>
              <p className="text-xs text-blue-700">Available COD payout / account balance</p>
            </div>
            <p className="font-mono text-xl font-bold text-blue-700">
              BDT {Number(balance.current_balance || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </div>

      {/* API Key Credentials Form */}
      <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          API Credentials Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              API Key {hasKeysSet && <span className="text-emerald-600 font-normal">(Configured)</span>}
            </label>
            <input
              type={showKeys ? "text" : "password"}
              placeholder={hasKeysSet ? "••••••••••••••••" : "Enter Steadfast Api-Key"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Secret Key {hasKeysSet && <span className="text-emerald-600 font-normal">(Configured)</span>}
            </label>
            <input
              type={showKeys ? "text" : "password"}
              placeholder={hasKeysSet ? "••••••••••••••••" : "Enter Steadfast Secret-Key"}
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Steadfast API Base URL
          </label>
          <input
            type="text"
            required
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showKeys}
              onChange={(e) => setShowKeys(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Show API keys in plain text
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving Credentials..." : "Save Steadfast API Settings"}
          </button>
        </div>
      </form>

      {/* Merchant Setup Guide */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-900 text-sm">How to get your Steadfast API Keys:</h4>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Log into your Steadfast Courier Merchant Portal at <a href="https://portal.steadfast.com.bd" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">portal.steadfast.com.bd</a>.</li>
          <li>Navigate to <strong>API Integration</strong> or <strong>Developer API</strong> in your merchant dashboard menu.</li>
          <li>Copy your <strong>API Key</strong> and <strong>Secret Key</strong> into the fields above.</li>
          <li>Click <strong>Save Steadfast API Settings</strong>. Now you can submit customer orders with 1-click directly from the Orders page!</li>
        </ol>
      </div>
    </div>
  );
}
