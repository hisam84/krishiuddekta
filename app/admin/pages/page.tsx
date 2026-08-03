"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import Link from "next/link";

interface PageItem {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  updatedAt: string;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [bodySummary, setBodySummary] = useState("");
  const [isHtmlView, setIsHtmlView] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pages");
      const data = await res.json();
      if (data.success) {
        setPages(data.pages || []);
      }
    } catch (err) {
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const resetForm = () => {
    setEditingPage(null);
    setTitle("");
    setBody("");
    setBodySummary("");
    setIsHtmlView(false);
  };

  const handleCommand = (command: string, value: string | undefined = undefined) => {
    if (typeof window !== "undefined") {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        setBody(editorRef.current.innerHTML);
      }
    }
  };

  const handleAddPage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = isHtmlView ? body : (editorRef.current?.innerHTML || body);
    if (!title.trim() || !content.trim()) {
      toast.error("Page title and content body are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body: content,
          body_summary: bodySummary,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("New page created successfully!");
        setShowModal(false);
        resetForm();
        fetchPages();
      } else {
        toast.error(data.message || "Failed to create page");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (p: PageItem) => {
    setEditingPage(p);
    setTitle(p.title);
    setBody(p.body);
    setBodySummary(p.bodySummary || "");
    setShowModal(true);

    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = p.body;
      }
    }, 100);
  };

  const handleUpdatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = isHtmlView ? body : (editorRef.current?.innerHTML || body);
    if (!editingPage || !title.trim() || !content.trim()) {
      toast.error("Page title and content body are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPage.id,
          title,
          body: content,
          body_summary: bodySummary,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Page updated successfully!");
        setShowModal(false);
        resetForm();
        fetchPages();
      } else {
        toast.error(data.message || "Failed to update page");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, pageTitle: string) => {
    if (!confirm(`Are you sure you want to delete page "${pageTitle}"?`)) return;

    try {
      const res = await fetch(`/api/admin/pages?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Page deleted successfully");
        fetchPages();
      } else {
        toast.error("Failed to delete page");
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
            Custom Pages (WordPress / Summernote Editor)
          </h1>
          <p className="text-xs text-neutral-500">
            Create, edit, and publish custom content pages (e.g. /about-us, /privacy-policy, /terms)
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="rounded border border-[#2271b1] bg-[#2271b1] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#135e96] cursor-pointer"
        >
          + Add New Page
        </button>
      </div>

      {loading ? (
        <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs text-neutral-500 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          Loading pages from database...
        </div>
      ) : pages.length === 0 ? (
        <div className="rounded border border-neutral-300 bg-white p-8 text-center text-xs shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-300">No pages found. Click "+ Add New Page" to create one.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-neutral-300 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
            <thead className="border-b border-neutral-300 bg-[#f6f7f7] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              <tr>
                <th className="px-4 py-3">Page Title</th>
                <th className="px-4 py-3">URL Path</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-[#f6f7f7]/60 dark:hover:bg-neutral-800/40">
                  <td className="px-4 py-3 font-bold text-[#2271b1] dark:text-blue-400">
                    {p.title}
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-500">
                    /{p.handle}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(p.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/${p.handle}`}
                        target="_blank"
                        className="text-[#2271b1] hover:underline font-semibold"
                      >
                        View Page ↗
                      </Link>
                      <button
                        onClick={() => handleEdit(p)}
                        className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 transition hover:bg-blue-600 hover:text-white dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
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

      {/* WordPress / Summernote Style Page Creator Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-4xl rounded-lg border border-neutral-300 bg-[#f0f0f1] p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#101517] max-h-[92vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between border-b border-neutral-300 pb-3 dark:border-neutral-800">
              <h2 className="text-xl font-bold text-[#1d2327] dark:text-white">
                {editingPage ? "Edit Page" : "Add New Page"}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-[#1d2327] font-bold text-lg hover:text-rose-600 dark:text-neutral-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingPage ? handleUpdatePage : handleAddPage} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  Page Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. About Us / Privacy Policy / Return Policy"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white px-4 py-2.5 text-base font-bold text-[#1d2327] focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  SEO Summary / Excerpt
                </label>
                <input
                  type="text"
                  placeholder="Short description for meta tags and search engine results..."
                  value={bodySummary}
                  onChange={(e) => setBodySummary(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#2271b1] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              {/* Rich Text Editor Box */}
              <div className="rounded border border-neutral-300 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                {/* Editor Toolbar */}
                <div className="flex flex-wrap items-center justify-between border-b border-neutral-200 bg-[#f6f7f7] px-3 py-2 gap-1 dark:border-neutral-800 dark:bg-neutral-800">
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCommand("bold")}
                      className="rounded border bg-white px-2 py-1 font-bold hover:bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-700 cursor-pointer"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCommand("italic")}
                      className="rounded border bg-white px-2 py-1 italic hover:bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-700 cursor-pointer"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCommand("underline")}
                      className="rounded border bg-white px-2 py-1 underline hover:bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-700 cursor-pointer"
                      title="Underline"
                    >
                      U
                    </button>

                    <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />

                    <button
                      type="button"
                      onClick={() => handleCommand("formatBlock", "<h1>")}
                      className="rounded border bg-white px-2 py-1 font-bold text-[11px] hover:bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-700 cursor-pointer"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCommand("formatBlock", "<h2>")}
                      className="rounded border bg-white px-2 py-1 font-bold text-[11px] hover:bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-700 cursor-pointer"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCommand("formatBlock", "<h3>")}
                      className="rounded border bg-white px-2 py-1 font-bold text-[11px] hover:bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-700 cursor-pointer"
                    >
                      H3
                    </button>

                    <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />

                    <button
                      type="button"
                      onClick={() => handleCommand("insertUnorderedList")}
                      className="rounded border bg-white px-2 py-1 hover:bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-700 cursor-pointer"
                      title="Bullet List"
                    >
                      • List
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCommand("insertOrderedList")}
                      className="rounded border bg-white px-2 py-1 hover:bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-700 cursor-pointer"
                      title="Numbered List"
                    >
                      1. List
                    </button>

                    <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />

                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt("Enter hyperlink URL:", "https://");
                        if (url) handleCommand("createLink", url);
                      }}
                      className="rounded border bg-white px-2 py-1 text-blue-600 hover:bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-700 cursor-pointer"
                    >
                      🔗 Link
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isHtmlView) {
                        setIsHtmlView(false);
                        setTimeout(() => {
                          if (editorRef.current) {
                            editorRef.current.innerHTML = body;
                          }
                        }, 50);
                      } else {
                        if (editorRef.current) {
                          setBody(editorRef.current.innerHTML);
                        }
                        setIsHtmlView(true);
                      }
                    }}
                    className="rounded border border-purple-300 bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 hover:bg-purple-600 hover:text-white dark:bg-purple-950 dark:text-purple-300 cursor-pointer"
                  >
                    {isHtmlView ? "👁️ Switch to Visual Preview" : "</> Switch to HTML Code"}
                  </button>
                </div>

                {/* Editor Content Area */}
                <div className="p-4">
                  {isHtmlView ? (
                    <textarea
                      rows={12}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full font-mono text-xs p-3 rounded border border-neutral-300 bg-neutral-900 text-emerald-400 focus:outline-none"
                    />
                  ) : (
                    <div
                      ref={editorRef}
                      contentEditable
                      onInput={() => {
                        if (editorRef.current) setBody(editorRef.current.innerHTML);
                      }}
                      className="min-h-[260px] w-full rounded border border-neutral-200 bg-white p-4 text-neutral-900 focus:outline-none prose max-w-none dark:bg-neutral-900 dark:text-white dark:border-neutral-800"
                    />
                  )}
                </div>
              </div>

              <div className="border-t pt-3 flex gap-2 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="w-1/2 rounded border border-neutral-300 py-2.5 font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 rounded border border-[#2271b1] bg-[#2271b1] py-2.5 font-bold text-white shadow transition hover:bg-[#135e96] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Publishing..." : (editingPage ? "Update Page" : "Publish Page")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
