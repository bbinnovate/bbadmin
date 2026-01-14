"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { updateDoc, doc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";


interface Career {
  id: string;
  title: string;
  description: string;
  isImmediate: boolean;
  isFeatured: boolean;
  postedAt: { seconds: number };
}

function renderEditorJsHTML(data: any) {
  if (!data || !data.blocks) return "";

  return data.blocks
    .map((block: any) => {
      switch (block.type) {
        // Header
        case "header":
          return `<h${block.data.level} class="my-4 font-bold">${block.data.text}</h${block.data.level}>`;

        // Paragraph
        case "paragraph":
          return `<p class="my-3">${block.data.text}</p>`;

        // List (ordered or unordered)
        case "list":
          const Tag = block.data.style === "ordered" ? "ol" : "ul";
          return `<${Tag} class="list-inside my-4 pl-6 ${
            Tag === "ol" ? "list-decimal" : "list-disc"
          }">${block.data.items
            .map((item: any) => {
              // Some Editor.js versions use 'content', others 'text'
              const text = item.content || item.text || "";
              return `<li>${text}</li>`;
            })
            .join("")}</${Tag}>`;

        // Checklist
        case "checklist":
          return `<ul class="my-4 space-y-2">${block.data.items
            .map((item: any, i: number) => {
              const text = item.content || item.text || "";
              return `<li class="flex items-center gap-2">
                        <input id="check-${i}" type="checkbox" ${
                          item.checked ? "checked" : ""
                        }/>
                        <label for="check-${i}" class="cursor-pointer">${text}</label>
                      </li>`;
            })
            .join("")}</ul>`;

        // Image
        case "image":
          return `<figure class="my-6">
                    <img src="${block.data.file?.url || ""}" alt="${
            block.data.caption || ""
          }" class="rounded-xl w-full"/>
                    ${
                      block.data.caption
                        ? `<figcaption class="text-center text-sm text-gray-500 mt-2">${block.data.caption}</figcaption>`
                        : ""
                    }
                  </figure>`;

        // Embed (YouTube, etc.)
        case "embed":
          return `<div class="my-6">
                    <iframe width="100%" height="400" src="${
                      block.data.embed || ""
                    }" frameborder="0" allowfullscreen></iframe>
                  </div>`;

        // Raw HTML
        case "raw":
          return block.data.html || "";

        // Default fallback
        default:
          return "";
      }
    })
    .join("");
}
export default function CareerCard({
  career,
  featuredId,
  setFeaturedId,
  onDelete,
}: {
  career: Career;
  featuredId: string | null;
  setFeaturedId: (id: string) => void;
  onDelete: (id: string) => void;
}) {

  const formattedDate = career.postedAt?.seconds
    ? (() => {
        const d = new Date(career.postedAt.seconds * 1000);
        const day = d.getDate();
        const month = d.toLocaleString("en-US", { month: "long" });
        const year = d.getFullYear();
        return `${day} ${month}, ${year}`;
      })()
    : "Recent";

  return (
    <div className="relative bg-white rounded shadow p-4 flex flex-col">
      {/* ✅ Image Placeholder (Same Style as Blogs) */}
      

      {/* ✅ Title */}
      <h5 className="font-semibold">{career.title}</h5>

      <button
  type="button"
  className="absolute top-3 right-3 z-50 cursor-pointer"
  onClick={async (e) => {
    e.stopPropagation();

    // 🔥 INSTANT UI UPDATE
    setFeaturedId(career.id);

    // 1️⃣ reset all stars in DB
    const snap = await getDocs(collection(db, "careers"));
    await Promise.all(
      snap.docs.map((d) =>
        updateDoc(doc(db, "careers", d.id), {
          isFeatured: false,
        })
      )
    );

    // 2️⃣ set current as featured in DB
    await updateDoc(doc(db, "careers", career.id), {
      isFeatured: true,
    });
  }}
>
  <Star
    size={18}
    className={
      featuredId === career.id
        ? "fill-yellow-400 text-yellow-400"
        : "text-gray-400 hover:text-yellow-400"
    }
  />
</button>




      {/* ✅ Tags (same badge style as blogs) */}
      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-600">
        {career.isImmediate && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
            Immediate Joiner
          </span>
        )}

        {/* ✅ Date */}
        <span className="text-gray-500">{formattedDate}</span>
      </div>

      {/* ✅ Description (same clamped layout as blogs) */}
      <div className="whitespace-pre-line text-sm text-gray-500 pr-1 sm:pr-2 job-description">

<div
  className="line-clamp-3"
  dangerouslySetInnerHTML={{
    __html: renderEditorJsHTML(career.description),
  }}
></div>

  

        </div>

      {/* ✅ Bottom buttons (same layout as blogs) */}
      <div className="mt-4 flex gap-2">
        <Link
          href={`/admin/careers/${career.id}`}
          className="px-3 py-1 border rounded text-sm"
        >
          Edit
        </Link>

        <button
          onClick={() => onDelete(career.id)}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm"
        >
          Delete
        </button>

        <a
          href="https://bombayblokes.com/join-our-team"
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1 border rounded text-sm ml-auto"
        >
          View
        </a>
      </div>
    </div>
  );
}
