"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import BlogForm from "../../components/BlogForm";
import Button from "@/app/components/Button";
import { toast } from "react-hot-toast";

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams(); // ✅ REQUIRED
  const slug = params.slug as string; // ✅ SAFE

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItem() {
      try {
        if (!slug) {
          toast.error("Invalid blog slug");
          router.push("/admin/blogs");
          return;
        }

        const q = query(collection(db, "blogs"), where("slug", "==", slug));
        const snap = await getDocs(q);

        if (snap.empty) {
          toast.error("Blog not found");
          router.push("/admin/blogs");
          return;
        }

        const doc = snap.docs[0];
        const data = doc.data();

        setBlog({
          id: doc.id,
          slug: data.slug,
          title: data.title,
          description: data.description ?? "",
          imageUrl: data.imageUrl ?? "",
          category: data.category ?? "",
          scheduledAt: data.scheduledAt
            ? new Date(data.scheduledAt.seconds * 1000)
            : null,
        });
      } catch (err) {
        console.error("Error loading blog:", err);
        toast.error("Failed to load blog");
        router.push("/admin/blogs");
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [slug, router]);

  if (loading) return <p>Loading...</p>;
  if (!blog) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold">Edit Blog</h3>

        <Button
          onClick={() => router.back()}
          text="Back"
          className="text-black"
        />
      </div>

      <BlogForm
        initial={{
          id: blog.id,
          slug: blog.slug,
          title: blog.title,
          description: blog.description,
          imageUrl: blog.imageUrl,
          category: blog.category,
          scheduledAt: blog.scheduledAt,
        }}
        onSuccess={() => {
          toast.success("Blog updated successfully");
          router.push("/admin/blogs");
        }}
      />
    </div>
  );
}
