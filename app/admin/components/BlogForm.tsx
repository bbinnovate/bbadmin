"use client";
import React, { useEffect, useRef, useState } from "react";
import { storage, db, auth } from "@/lib/firebase";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc as firestoreDoc,
  Timestamp,
} from "firebase/firestore";

import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image";
import RawTool from "@editorjs/raw";
import Checklist from "@editorjs/checklist";
import Image from "next/image";
import { toast } from "react-hot-toast";
const Embed = require("@editorjs/embed");

import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { ChevronDown } from "lucide-react";
import Button from "@/app/components/Button";

// ✅ Helper — sanitize undefined/null recursively
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

const createSlug = (str: string): string =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const CATEGORY_OPTIONS = [
  "ALL",
  "WEB DEVELOPMENT",
  "UX/UI DESIGNING",
  "SOCIAL MEDIA",
  "PERFORMANCE MARKETING",
  "DESIGN & BRANDING",
  "SEO",
  "GEO",
];

export default function BlogForm({ initial, onSuccess }: { initial?: any; onSuccess: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initial?.imageUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultDate = initial?.scheduledAt
    ? new Date(initial.scheduledAt)
    : new Date();

  const [publishTime, setPublishTime] = useState(defaultDate.toTimeString().slice(0, 5));

  const editorRef = useRef<EditorJS | null>(null);
  const editorContainer = useRef<HTMLDivElement | null>(null);

  // For Date Picker UI
  const dateRef = useRef<HTMLDivElement>(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(defaultDate);

  // Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setOpenDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => setSlug(createSlug(title)), [title]);

  useEffect(() => {
    if (!editorContainer.current) return;

    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: editorContainer.current,
        data: initial?.description || undefined,
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
                  const url = await uploadImageAndGetURL(file);
                  return { success: 1, file: { url } };
                },
              },
            },
          },
        },
        placeholder: "Write your blog content here...",
        inlineToolbar: ["link", "bold", "italic"],
        onReady: () => {
          editorRef.current = editor;
        },
      });
    }
  }, []);

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB");
      return;
    }
    setFile(f);
    setError(null);
  };

  const uploadImageAndGetURL = async (f: File): Promise<string> => {
    const fileName = `${Date.now()}_${f.name}`;
    const sRef = storageRef(storage, `blogimages/${fileName}`);
    const uploadTask = uploadBytesResumable(sRef, f);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        undefined,
        reject,
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    try {
      const editorData: OutputData | undefined = await editorRef.current?.save();
      const cleanEditorData = sanitizeData(editorData);

      let imageUrl = initial?.imageUrl ?? "";
      if (file) imageUrl = await uploadImageAndGetURL(file);

      const finalSlug = createSlug(title);
      const finalCategory = category?.trim() || "ALL";

      const dt = new Date(selectedDate);
      dt.setHours(Number(publishTime.split(":")[0]));
      dt.setMinutes(Number(publishTime.split(":")[1]));
      const scheduledAt = Timestamp.fromDate(dt);

      const blogData = {
        title,
        slug: finalSlug,
        description: cleanEditorData,
        imageUrl,
        category: finalCategory,
        scheduledAt,
        ...(initial?.id
          ? { updatedAt: serverTimestamp() }
          : {
              postedAt: serverTimestamp(),
              authorId: auth.currentUser?.uid ?? null,
            }),
      };

      if (initial?.id) {
        const ref = firestoreDoc(db, "blogs", initial.id);
        await updateDoc(ref, blogData);
      } else {
        await addDoc(collection(db, "blogs"), blogData);
        toast.success("Blog created successfully");
      }

      onSuccess?.();
    } catch (err: unknown) {
      console.error("🔥 Error creating blog:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save blog";
      setError(errorMessage);
      toast.error("Error saving blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-6 space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter blog title"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <div
          ref={editorContainer}
          className="border rounded w-full p-4 text-left h-auto overflow-visible"
          style={{
            lineHeight: "1.6",
            fontSize: "16px",
            zIndex: "999",
          }}
        ></div>
      </div>

      {/* Category */}
      <div className="relative ">
  <label className="block text-sm font-medium mb-1">Category</label>

  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="w-full border rounded px-3 py-2 cursor-pointer"
  >
    {CATEGORY_OPTIONS.map((cat) => (
      <option key={cat} value={cat}>
        {cat}
      </option>
    ))}
  </select>

  <ChevronDown className="absolute right-3 top-9 w-4 h-4 text-gray-600 pointer-events-none" />
</div>


      {/* Publish Date Picker */}
      <div className="relative" ref={dateRef}>
        <label className="block text-sm font-medium mb-1">Publish Date</label>
        <div
          className="appearance-none w-full border rounded px-3 py-2  focus:outline-none cursor-pointer flex justify-between items-center"
          onClick={() => setOpenDatePicker(!openDatePicker)}
        >
          <span>{selectedDate.toDateString()}</span>
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </div>

        {openDatePicker && (
          <div className="absolute z-50 mt-1 bg-white shadow-lg rounded-lg">
            <DateRange
              editableDateInputs
              ranges={[
                {
                  startDate: selectedDate,
                  endDate: selectedDate,
                  key: "selection",
                },
              ]}
              onChange={(item:any) => {
                if (item.selection) {
                  setSelectedDate(item.selection.startDate ?? new Date());
                }
              }}
              moveRangeOnFirstSelection={false}
              direction="horizontal"
              months={1}
              rangeColors={["#000"]}
            />
          </div>
        )}
      </div>

      {/* Publish Time */}
     <div>
  <label className="block text-sm font-medium mb-1">Publish Time</label>
  <input
    type="time"
    value={publishTime}
    onChange={(e) => setPublishTime(e.target.value)}
    className="w-full border rounded px-3 py-2 cursor-pointer"
    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
  />
</div>


      {/* Image */}
      <div>
        <label className="block text-sm font-medium mb-1">Image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && (
  <div className="mt-3">
    <div className="text-xs text-gray-500 mb-1">Preview</div>

    {/* FIXED IMAGE PREVIEW */}
    <div className="relative w-full h-48 rounded overflow-hidden bg-gray-100">
      <Image
        src={preview}
        alt="Preview Image"
        fill
        className="object-cover"
        sizes="100vw"
      />
    </div>
  </div>
)}

      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <Button
  onClick={handleCreate}
  disabled={loading}
  className=" text-black "
  text={loading ? "Saving..." : initial?.id ? "Update Blog" : "Create Blog"}
/>

    </div>
  );
}
