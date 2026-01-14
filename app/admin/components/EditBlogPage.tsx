"use client";

import { useParams } from "next/navigation";

export default function EditBlogPage() {
  const params = useParams();
  const slug = params.slug as string;

  console.log("Editing blog:", slug);

  return <div>Edit blog: {slug}</div>;
}
