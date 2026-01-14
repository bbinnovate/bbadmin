"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import Link from "next/link";
import Button from "@/app/components/Button";
import { toast } from "react-hot-toast";

type Blog = {
  id: string;
  slug: string;
  title: string;
  description: any;
  imageUrl?: string;
  scheduledAt?: any;
  postedAt?: any;
  isPublished?: boolean;
  authorId?: string | null;
  category?: string;
};

// ✅ EditorJS → HTML converter (KEEP THIS)
function renderEditorJsHTML(blocks: any) {
  if (!blocks || !blocks.blocks) return "";

  return blocks.blocks
    .map((block: any) => {
      switch (block.type) {
        case "header":
          return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;

        case "paragraph":
          return `<p>${block.data.text}</p>`;

        case "list":
          const tag = block.data.style === "ordered" ? "ol" : "ul";
          return `<${tag}>${block.data.items
            .map((i: any) => `<li>${i}</li>`)
            .join("")}</${tag}>`;

        case "image":
          return `<img src="${block.data.file.url}" />`;

        default:
          return "";
      }
    })
    .join("");
}

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "blogs"), orderBy("postedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const items: Blog[] = [];
      snap.forEach((s) => items.push({ id: s.id, ...(s.data() as any) }));
      setBlogs(items);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog? This action cannot be undone.")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "blogs", id));
      toast.success("Blog deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete blog");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold">Blogs</h3>

        <Button
          href="/admin/blogs/new"
          text="Add Blog"
          className="text-black font-semibold"
        />
      </div>

      {/* Blogs List */}
      <div>
        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : blogs.length === 0 ? (
          <div className="text-gray-600">No blogs yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogs.map((b) => {
              const showDate = b.scheduledAt || b.postedAt;
              const formattedDate = showDate
                ? (() => {
                    const d = new Date(showDate.seconds * 1000);

                    const day = d.getDate();
                    const month = d.toLocaleString("en-US", {
                      month: "long",
                    });
                    const year = d.getFullYear();

                    const time = d.toLocaleString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });

                    return `${day} ${month}, ${year} ${time}`;
                  })()
                : "Recent";

              const isLive =
                b.scheduledAt?.seconds &&
                new Date(b.scheduledAt.seconds * 1000) <= new Date();

              return (
                <div
                  key={b.id}
                  className="bg-white rounded shadow p-4 flex flex-col"
                >
                  {/* Image */}
                  {b.imageUrl ? (
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-full h-40 object-cover rounded mb-3"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded mb-3" />
                  )}

                  {/* Title */}
                  <h5 className="font-semibold">{b.title}</h5>

                  {/* Category & Time */}
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-600">
                    {b.category && b.category !== "All" && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                        {b.category}
                      </span>
                    )}

                    {showDate?.seconds && (
                      <span className="text-gray-500">{formattedDate}</span>
                    )}

                    {b.scheduledAt?.seconds && !b.isPublished ? (
                      isLive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          Posted
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                          Scheduled
                        </span>
                      )
                    ) : b.postedAt?.seconds ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Posted
                      </span>
                    ) : null}
                  </div>

                  {/* ✅ FIXED DESCRIPTION */}
                  <div
                    className="
                      text-sm text-gray-600 
                      line-clamp-3 
                      mt-2 
                      prose 
                      max-w-none
                    "
                    // dangerouslySetInnerHTML={{
                    //   __html: renderEditorJsHTML(b.description),
                    // }}
                  />

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/admin/blogs/${b.slug}`}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(b.id)}
                      disabled={deleting === b.id}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm disabled:opacity-60"
                    >
                      {deleting === b.id ? "Deleting..." : "Delete"}
                    </button>

                    <a
                      href={`https://bombayblokes.com/blogs/${b.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 border rounded text-sm ml-auto"
                    >
                      View
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
