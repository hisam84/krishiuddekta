import { ReactNode } from "react";
import { AdminLayoutWrapper } from "components/admin/admin-layout-wrapper";

export const metadata = {
  title: "Admin Dashboard | Krishi Uddokta",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
