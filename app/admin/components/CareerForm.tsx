"use client";

import React, { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  updateDoc,
  collection,
  doc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Checklist from "@editorjs/checklist";
import RawTool from "@editorjs/raw";
import ImageTool from "@editorjs/image";
import Button from "@/app/components/Button";


type CareerCategory = {
  id: string;
  name: string;
  slug: string;
  position: number;
  isFeatured?: boolean;
};
const Embed = require("@editorjs/embed");

function sanitizeData(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data
      .map((item) => sanitizeData(item))
      .filter((item) => item !== undefined && item !== null);
  } else if (typeof data === "object" && data !== null) {
    const cleanObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        cleanObj[key] = sanitizeData(value);
      }
    }
    return cleanObj;
  }
  return data;
}

export default function CareerForm({ existingCareer }: { existingCareer?: any }) {
  const [title, setTitle] = useState(existingCareer?.title || "");
  const [category, setCategory] = useState(existingCareer?.category || "");
  const [isImmediate, setIsImmediate] = useState(existingCareer?.isImmediate || false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("published");
  const [categories, setCategories] = useState<CareerCategory[]>([]);

  const editorRef = useRef<EditorJS | null>(null);
  const editorContainer = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!editorContainer.current) return;
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: editorContainer.current,
        data: existingCareer?.description || undefined,
        autofocus: true,
        tools: {
          header: Header,
          list: List,
          checklist: Checklist,
          embed: Embed,
          raw: RawTool,
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  return { success: 1, file: { url: URL.createObjectURL(file) } };
                },
              },
            },
          },
        },
        onReady: () => {
          editorRef.current = editor;
        },
      });
    }
  }, [editorContainer]);



useEffect(() => {
  const fetchCategories = async () => {
    const snapshot = await getDocs(
      query(
        collection(db, "careerCategories"),
        orderBy("position", "asc")
      )
    );

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CareerCategory[];

    setCategories(data);
  };

  fetchCategories();
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const editorData: OutputData | undefined = await editorRef.current?.save();
      const cleanData = sanitizeData(editorData);

      const careerData = {
        title,
        description: cleanData,
        category,
        status,
        isImmediate,
        ...(existingCareer ? { updatedAt: serverTimestamp() } : { postedAt: serverTimestamp() }),
      };

      if (existingCareer) {
        await updateDoc(doc(db, "careers", existingCareer.id), careerData);
        toast.success("Career updated successfully");
      } else {
        await addDoc(collection(db, "careers"), careerData);
        toast.success("Career added successfully");
      }

      router.push("/admin/careers");
    } catch (err) {
      toast.error("Error saving career");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded-md space-y-4">

      <div>
        <label className="block text-sm font-semibold mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      {/* CATEGORY DROPDOWN */}
    <div>
  <label className="block text-sm font-semibold mb-1">
    Category
  </label>

  <select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  {categories.map((cat: any) => (
    <option key={cat.id} value={cat.slug}>
      {cat.name}
    </option>
  ))}
</select>
</div>

      <div>
        <label className="block text-sm font-semibold mb-1">Description</label>
        <div ref={editorContainer} className="border rounded-md p-4 min-h-[200px]" />
      </div>


      <div>
        <label className="block text-sm font-semibold mb-2">Is Immediate Hiring?</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={isImmediate === true}
              onChange={() => setIsImmediate(true)}
            />
            Yes
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={isImmediate === false}
              onChange={() => setIsImmediate(false)}
            />
            No
          </label>
        </div>
      </div>

      {/* {error && <div className="text-red-500 text-sm">{error}</div>} */}

      <div className="flex gap-3">



        <Button
                 type="submit"
    onClick={() => setStatus("draft")}
                  text=" Save Draft"
                  className="text-black font-semibold"
                />

                <Button
                          type="submit"
    onClick={() => setStatus("published")}
                          text="Publish Career"
                          className="text-black font-semibold"
                        />



</div>
    </form>
  );
}
