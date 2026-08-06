import Footer from "components/layout/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="w-full min-h-[70vh]">{children}</div>
      <Footer />
    </>
  );
}

