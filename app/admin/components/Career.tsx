"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import CareerCard from "../components/CareerCard";
import Button from "@/app/components/Button";
import {
  Pencil,
  Trash2,
  Eye,
  Star,
  ChevronDown,
  Search,
} from "lucide-react";


interface Career {
  id: string;
  title: string;
  description: {
    blocks?: any[];
  };
  isImmediate: boolean;
  isFeatured: boolean;
  status?: "draft" | "published";
  category?: string;
  postedAt?: { seconds: number };
  updatedAt?: { seconds: number };
}

const sortCareersByLastUpdated = (careers: Career[]) =>
  [...careers].sort((a, b) => {
    const getSeconds = (timestamp?: { seconds: number }) =>
      timestamp?.seconds || 0;

    return (
      getSeconds(b.updatedAt || b.postedAt) -
      getSeconds(a.updatedAt || a.postedAt)
    );
  });

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

export default function Career() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const appsPerPage = 50;
  const [filteredApps, setFilteredApps] = useState<Career[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const indexOfLast = currentPage * appsPerPage;
  const indexOfFirst = indexOfLast - appsPerPage;
  const currentApps = filteredApps.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredApps.length / appsPerPage);
  const allCategories = [
  ...new Set(
    careers
      .map((career) => career.category)
      .filter(Boolean)
  ),
];


  const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages) setCurrentPage(page);
  }


useEffect(() => {
  const current = careers.find(c => c.isFeatured);
  if (current) setFeaturedId(current.id);
}, [careers]);


  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "careers"));

        let data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Career[];

        // Sort by the latest edit, falling back to the original posting time for
        // careers created before updatedAt was introduced.
        data = sortCareersByLastUpdated(data);

        setCareers(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch careers");
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, []);

  useEffect(() => {
  let filtered = [...careers];

  // 🔍 Search by title
  if (searchTerm.trim()) {
    filtered = filtered.filter((career) =>
      career.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }

  // 📌 Filter by status
  if (selectedStatus) {
    filtered = filtered.filter(
      (career) =>
        (career.status || "published") ===
        selectedStatus
    );
  }


  // 🧩 Filter by category
if (selectedCategory) {
  filtered = filtered.filter(
    (career) =>
      career.category
        ?.toLowerCase()
        .trim() ===
      selectedCategory
        .toLowerCase()
        .trim()
  );
}

  setFilteredApps(filtered);
  setCurrentPage(1);
}, [
  careers,
  searchTerm,
  selectedStatus,
  selectedCategory,
]);

const handleDelete = async (id: string) => {
  const confirmDelete = confirm(
    "Are you sure you want to delete this career?"
  );

  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "careers", id));

    setCareers((prev) => prev.filter((c) => c.id !== id));

    toast.success("Career deleted successfully");
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete career");
  }
};

const toggleStatus = async (
  id: string,
  currentStatus?: string
) => {
  try {

    // ✅ old jobs without status = published
    const normalizedStatus =
      currentStatus || "published";

    const newStatus =
      normalizedStatus === "published"
        ? "draft"
        : "published";

    // ✅ firestore update
    await updateDoc(doc(db, "careers", id), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    // ✅ instant ui update
    setCareers((prev) =>
      sortCareersByLastUpdated(prev.map((career) =>
        career.id === id
          ? {
              ...career,
              status: newStatus as "draft" | "published",
              updatedAt: Timestamp.now(),
            }
          : career
      ))
    );

    toast.success(
      newStatus === "published"
        ? "Career published"
        : "Career moved to draft"
    );

  } catch (error) {
    console.error(error);
    toast.error("Failed to update status");
  }
};

const formatLastUpdated = (
  updatedAt?: { seconds: number },
  postedAt?: { seconds: number }
) => {
  const timestamp = updatedAt || postedAt;

  if (timestamp?.seconds) {
    const d = new Date(timestamp.seconds * 1000);

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  }

  return "--/--/---- --:--";
};


const createSlug = (title: string) => {
  return title.replace(/\s+/g, "_");
};
  return (
    // <div className="">
    //   <div className="flex justify-between items-center mb-4">
    //     <h3 className="text-2xl font-bold">Careers Management</h3>

    //     <Button
    //       href="/admin/careers/new"
    //       text="Add Career"
    //       className="text-black font-semibold"
    //     />
    //   </div>


    <div className="relative">
       <div className="flex justify-between items-center ">
      <h3 className="text-xl font-semibold mb-5">
        Careers Management
      </h3>
       <Button
          href="/admin/careers/new"
          text="Add Career"
          className="text-black font-semibold"
        />
        </div>

     {/* Filters */}
           <div className="flex flex-wrap gap-3 mb-4">
             <input
               placeholder="Search Job Title"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className=" border rounded-lg px-3 py-2
             flex-[2] min-w-[220px] max-w-full
             focus:outline-none text-base text-black"
             />
     

       {/* 🧩 Service */}
       {/* 🧩 Category Filter */}
<div className="relative min-w-[200px]">
 <div className="relative min-w-[220px]">
  <select
  value={selectedCategory}
  onChange={(e) =>
    setSelectedCategory(e.target.value)
  }
  className="
    appearance-none
    border rounded-lg px-4 py-2.5 pr-10
    w-full text-sm text-black bg-white
    cursor-pointer focus:outline-none
    capitalize
  "
>
  <option value="">
    All Categories
  </option>

  {allCategories.map((category) => (
    <option
      key={category}
      value={category}
    >
      {category}
    </option>
  ))}
</select>

  <ChevronDown
    size={16}
    className="
      absolute right-3 top-1/2
      -translate-y-1/2
      text-gray-500
      pointer-events-none
    "
  />
</div>

  <ChevronDown
    size={16}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
  />
</div>
     
            
           </div>

      {loading ? (
        <p>Loading careers...</p>
      ) : careers.length === 0 ? (
        <p>No careers found.</p>
      ) : (


        
        <div className=" gap-4">
          <div
  ref={tableScrollRef}
  className="relative w-full min-w-0 overflow-x-auto overflow-y-auto max-h-[75vh] border rounded-lg shadow"
  onWheel={(e) => {
    if (!tableScrollRef.current) return;
    const el = tableScrollRef.current;
    if (el.scrollHeight > el.clientHeight) {
      e.preventDefault();
      el.scrollTop += e.deltaY;
    }
  }}
>


          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                 <th className="p-3 text-left">SR No.</th>
                <th className="p-3 text-left">Job Title</th>
                <th className="p-3 text-left">Description</th>
                {/* <th className="p-3 text-left">Category</th> */}
                <th className="p-3 text-left">Prioraty</th>
                <th className="p-3 justify-center">Availability</th>
                <th className="p-3 justify-center">Last Updated</th>
                <th className="p-3 justify-center">Status</th>
                <th className="p-3 justify-center">Action</th>
              </tr>
            </thead>
            <tbody >
                  {currentApps.map((career) => (
                <tr key={career.id} className="border-t ">
                  <td className="p-3 capitalize">{indexOfFirst + careers.indexOf(career) + 1}</td>
                  <td className="p-3 capitalize">{career.title}</td>
                 <td className="p-3 max-w-[200px] capitalize">
 {(career.description?.blocks?.length ?? 0) > 0 ? ( 
    <div
      className="line-clamp-2"
      dangerouslySetInnerHTML={{
        __html: renderEditorJsHTML(career.description),
      }}
    />
  ) : (
    <span className="text-gray-400 italic">
      No Description
    </span>
  )}
</td> 

{/* <td className="p-3 capitalize">
  {career.category || "General"}
</td> */}
                             
<td className="p-3 text-center">
  <button
    type="button"
    className="inline-flex items-center justify-center cursor-pointer"
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
        ? "fill-yellow-400 text-[#fab31e]"
        : "text-gray-400 hover:text-[#fab31e] "
    }
  />
</button>

</td>
                 <td className="p-3">
  <select
    value={career.isImmediate ? "yes" : "no"}
    onChange={async (e) => {
      const value = e.target.value === "yes";

      try {
        // 🔥 instant UI update
        setCareers((prev) =>
          sortCareersByLastUpdated(prev.map((item) =>
            item.id === career.id
              ? {
                  ...item,
                  isImmediate: value,
                  updatedAt: Timestamp.now(),
                }
              : item
          ))
        );

        // ✅ firestore update
        await updateDoc(
          doc(db, "careers", career.id),
          {
            isImmediate: value,
            updatedAt: serverTimestamp(),
          }
        );

        toast.success(
          value
            ? "Set as Immediate"
            : "Set as Not Immediate"
        );

      } catch (error) {
        console.error(error);
        toast.error(
          "Failed to update availability"
        );
      }
    }}
    className={`
      border rounded-lg px-3 py-2 text-sm
      focus:outline-none cursor-pointer
      ${
        career.isImmediate
          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
          : "bg-gray-100 text-gray-700 border-gray-300"
      }
    `}
  >
    <option value="yes">
      Immediate Joiner
    </option>

    <option value="no">
      Not Immediate
    </option>
  </select>
</td>

        {/* <td className="p-3 capitalize">{career.title}</td> */}
                  <td className="p-3 capitalize">
  {formatLastUpdated(career.updatedAt, career.postedAt)}
</td>

<td className="p-3 ">
  <button
    onClick={() =>
      toggleStatus(career.id, career.status)
    }
    className={`relative w-20 h-9 rounded-full transition-all duration-300 cursor-pointer ${
      (career.status || "published") === "published"
        ? "bg-[#fab31e]"
        : "bg-gray-300"
    }`}
  >
    <div
      className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-md transition-all duration-300 ${
        (career.status || "published") === "published"
          ? "left-12"
          : "left-1"
      }`}
    />

    <span
      className={`absolute text-[10px] font-semibold top-1/2 -translate-y-1/2 ${
     (career.status || "published") === "published"
          ? "left-2 text-white"
          : "right-2 text-gray-700"
      }`}
    >
      {(career.status || "published") === "published"
        ? "LIVE"
        : "DRAFT"}
    </span>
  </button>
</td>
                 
 
                 <td className="p-3">
  <div className="flex items-center gap-2">
    
    <Link
      href={`/admin/careers/${career.id}`}
      className="p-2 border rounded-md hover:bg-gray-100 transition"
      title="Edit"
    >
      <Pencil size={16} />
    </Link>

    <button
      onClick={() => handleDelete(career.id)}
      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition cursor-pointer"
      title="Delete"
    >
      <Trash2 size={16} />
    </button>

   <a
  href={`https://bombayblokes.com/join-our-team/${createSlug(career.title)}?id=${career.id}`}
      target="_blank"
      rel="noreferrer"
      className="p-2 border rounded-md hover:bg-gray-100 transition"
      title="View"
    >
      <Eye size={16} />
    </a>

  </div>
</td>
                  
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
{totalPages > 1 && (
  <div className="flex justify-center items-center mt-4 gap-2 py-4">
    <button
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Prev
    </button>

    {[...Array(totalPages)].map((_, i) => (
      <button
        key={i}
        onClick={() => setCurrentPage(i + 1)}
        className={`px-3 py-1 border rounded ${
          currentPage === i + 1 ? "bg-gray-800 text-white" : ""
        }`}
      >
        {i + 1}
      </button>
    ))}

    <button
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>
)}

        </div>   
          {/* {careers.map((career) => (
            <CareerCard
              key={career.id}
              career={career}
              onDelete={handleDelete}
              featuredId={featuredId}
                          setFeaturedId={setFeaturedId}
            />
          ))} */}
        </div>


      )}
    </div>
  );
}







