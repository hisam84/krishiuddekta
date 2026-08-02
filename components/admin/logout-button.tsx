"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Logged out successfully");
        router.push("/admin/login");
        router.refresh();
      } else {
        toast.error("Failed to logout");
      }
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-xs text-neutral-400 hover:text-rose-400 hover:underline font-semibold"
    >
      Logout
    </button>
  );
}
