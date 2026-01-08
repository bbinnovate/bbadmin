"use client";

import React from "react";
import BlogForm from "../../components/BlogForm";
import { useRouter } from "next/navigation";
import Button from "@/app/components/Button";

export default function NewBlogPage() {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold">Create New Blog</h3>
       <Button
  onClick={() => router.back()}
  className="text-black"
  text="Back"
/>

      </div>

      <BlogForm
      initial={{}}
        onSuccess={() => {
          // alert("Blog created");
          router.push("/admin/blogs");
        }}
      />
    </div>
  );
}
