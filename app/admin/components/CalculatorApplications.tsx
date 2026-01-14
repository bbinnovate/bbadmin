"use client";

import { useEffect, useRef, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DateRange } from "react-date-range";
import { ChevronDown } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

/* ================= TYPES ================= */

type QuoteItem = {
  label: string;
  type: string;
  value: string;
  question: string;
  price: number;
};

type CalculatorApp = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  serviceCalculator: string;
  quote: QuoteItem[];
  total: number;
  finalPrice: number;
  createdAt?: { seconds: number };
};

type DateRangeState = {
  startDate?: Date;
  endDate?: Date;
  key: string;
};

/* ================= HELPERS ================= */

const capitalizeWords = (value?: string) =>
  value
    ? value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : "-";

const formatDate = (seconds?: number) =>
  seconds
    ? new Date(seconds * 1000).toLocaleDateString("en-GB")
    : "-";

/* ================= COMPONENT ================= */

export default function CalculatorApplications() {
  const [apps, setApps] = useState<CalculatorApp[]>([]);
  const [filtered, setFiltered] = useState<CalculatorApp[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
   const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [viewApp, setViewApp] = useState<CalculatorApp | null>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const appsPerPage = 50;
  const indexOfLast = currentPage * appsPerPage;
  const indexOfFirst = indexOfLast - appsPerPage;
  const currentApps = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / appsPerPage);

  /* Date Filter */
  const [open, setOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState<DateRangeState[]>([
    { startDate: undefined, endDate: undefined, key: "selection" },
  ]);

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchData = async () => {
      const q = query(
        collection(db, "calculatorApplications"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CalculatorApp[];

      setApps(data);
      setFiltered(data);
      setLoading(false);
    };
    fetchData();
  }, []);


  // Close date picker
    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

  /* ================= FILTERS ================= */

useEffect(() => {
  let filtered = apps; // ✅ FIXED

  const { startDate, endDate } = dateRange[0];

  // 🔍 Search filter
  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    filtered = filtered.filter((a) =>
      (a.name || "").toLowerCase().includes(lower) ||
      (a.email || "").toLowerCase().includes(lower) ||
      (a.phone || "").includes(searchTerm)
    );
  }

  // 🧩 Service filter
  if (selectedService) {
    const selected = selectedService.toLowerCase();
    filtered = filtered.filter((a) =>
      a.serviceCalculator?.toLowerCase().includes(selected)
    );
  }

  // 📅 Date filter
  if (startDate && endDate) {
    const s = new Date(startDate).setHours(0, 0, 0, 0);
    const e = new Date(endDate).setHours(23, 59, 59, 999);

    filtered = filtered.filter((a) => {
      if (!a.createdAt) return false;
      const d = a.createdAt.seconds * 1000;
      return d >= s && d <= e;
    });
  }

  setFiltered(filtered);
  setCurrentPage(1);
}, [apps, searchTerm, selectedService, dateRange]);


  const allServices = [...new Set(apps.map((a) => a.serviceCalculator))];


    // Export CSV popup
    const today = new Date();
    const [showExportRange, setShowExportRange] = useState(false);
    const [exportRange, setExportRange] = useState<DateRangeState[]>([
      { startDate: today, endDate: today, key: "export" },
    ]);


    const formatDDMMYYYY = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const capitalizeWords = (value?: string) =>
  value
    ? value
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "";



const handleExportCSV = () => {
  const { startDate, endDate } = exportRange[0];
  if (!startDate || !endDate) return;

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const filtered = apps.filter((a) => {
    if (!a.createdAt) return false;
    const d = a.createdAt.seconds * 1000;
    return d >= start.getTime() && d <= end.getTime();
  });

  if (!filtered.length) {
    alert("No records found for selected date range");
    return;
  }

  const csv =
    "Date,Name,Email,Phone,Service,Questions,Final Price\n" +
    filtered
      .map((a) =>
        [
          new Date(a.createdAt!.seconds * 1000).toLocaleDateString("en-GB"),
          capitalizeWords(a.name || "-"),
          a.email || "-",
          a.phone || "-",
          capitalizeWords(a.serviceCalculator),
          a.quote
            ?.slice(0, 3)
            .map((q) => `${capitalizeWords(q.type)}: ${capitalizeWords(q.value)}`)
            .join(" | "),
          `${a.finalPrice}`,
        ]
          .map((v) => `"${v}"`)
          .join(",")
      )
      .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Calculator Applications ${formatDDMMYYYY(start)} to ${formatDDMMYYYY(end)}.csv`;
  link.click();
};


  /* ================= UI ================= */

  return (
    <div className="relative">
      <h3 className="text-xl font-semibold mb-5">
        Calculator Applications
      </h3>

     {/* Filters */}
           <div className="flex flex-wrap gap-3 mb-4">
             <input
               placeholder="Search Name, Email Or Phone"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className=" border rounded-lg px-3 py-2
             flex-[2] min-w-[220px] max-w-full
             focus:outline-none text-base text-black"
             />
     
             {/* Date */}
             <div className="relative flex-[1.5] min-w-[220px]" ref={dateRef}>
         <div
           onClick={() => setOpen(!open)}
           className="
             border rounded-lg px-4 py-2
             flex items-center justify-between
             cursor-pointer bg-white
             h-[42px]
           "
         >
           <span className="truncate text-base text-black">
             {dateRange[0].startDate
               ? `${dateRange[0].startDate.toDateString()} → ${dateRange[0].endDate?.toDateString()}`
               : "Filter By Date"}
           </span>
           <ChevronDown className="w-4 h-4 text-black" />
         </div>
     
         {open && (
           <div className="absolute z-50 bg-white shadow rounded-lg mt-1">
             <DateRange
               ranges={dateRange}
               onChange={(item :any) =>
                 setDateRange([{ ...item.selection, key: "selection" }])
               }
             />
           </div>
         )}
       </div>
     
       {/* 🧩 Service */}
       <div className="relative w-[200px]">
         <select
           value={selectedService}
           onChange={(e) => setSelectedService(e.target.value)}
           className="
             border rounded-lg px-4 py-2 pr-10
             w-full h-[42px]  focus:outline-none
             appearance-none cursor-pointer text-base text-black capitalize
           "
         >
           <option value="">All Services</option>
           {allServices.map((s) => (
             <option key={s}>{s}</option>
           ))}
         </select>
     
         {/* Perfect arrow */}
         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
       </div>
     
             <button
               onClick={() => setShowExportRange(true)}
               className="bg-black text-white px-4 py-2 rounded-lg  cursor-pointer"
             >
               Export CSV
             </button>
           </div>

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
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-3">SR No.</th>
              <th className="px-2 py-3">Date</th>
              <th className="px-2 py-3">Name</th>
              <th className=" px-2 py-3 ">Service</th>
              <th className="w-[140px] px-1 py-3">Questions</th>
              <th className="px-2 py-3">Final Price</th>
              <th className="w-[140px]  px-2 py-3">Contact</th>
              <th className="px-2 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentApps.map((a, i) => (
              <tr key={a.id} className="border-t">
                <td className="px-4 py-3 text-center">{indexOfFirst + i + 1}</td>
                <td className="px-4 py-3 text-center">{formatDate(a.createdAt?.seconds)}</td>
                <td className="px-4 py-3 text-center capitalize">{a.name || "-"}</td>
                <td className="px-4 py-3 capitalize">{a.serviceCalculator}</td>

                 {/* QUESTIONS (FIXED WIDTH + CLAMP) */}
        <td className="px-2 py-3">
          <div className="space-y-1 text-black text-sm">
            {a.quote?.slice(0, 3).map((q, idx) => (
              <p
                key={idx}
                className="truncate"
                title={`${capitalizeWords(q.type)}: ${capitalizeWords(q.value)}`}
              >
                <span className="font-medium">
                  {capitalizeWords(q.type)}
                </span>
                :{" "}
                <span className="text-gray-600">
                  {capitalizeWords(q.value)}
                </span>
              </p>
            ))}

          </div>
        </td>

                <td className="p-3 font-semibold text-center">
                  ₹{Number(a.finalPrice || 0).toLocaleString("en-IN")}

                </td>

                <td className="p-3">
                  <a
                    href={`mailto:${a.email}`}
                    className="text-blue-600 hover:underline block"
                  >
                    {a.email || "-"}
                  </a>
                  <a
                    href={`tel:${a.phone}`}
                    className="text-blue-600 hover:underline block"
                  >
                    {a.phone || "-"}
                  </a>
                </td>

               <td className="p-3">
  <div className="flex justify-end pr-5">
    <button
      onClick={() => setViewApp(a)}
      className="bg-gray-800 text-white px-5 py-1 rounded cursor-pointer"
    >
      View
    </button>
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
      className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
    >
      Prev
    </button>

    {[...Array(totalPages)].map((_, i) => (
      <button
        key={i}
        onClick={() => setCurrentPage(i + 1)}
        className={`px-3 py-1 border rounded cursor-pointer ${
          currentPage === i + 1 ? "bg-gray-800 text-white" : ""
        }`}
      >
        {i + 1}
      </button>
    ))}

    <button
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
    >
      Next
    </button>
  </div>
)}
      </div>

      {/* VIEW MODAL */}
      {viewApp && (
        <div
          className="fixed flex-1 overflow-y-auto inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setViewApp(null)}
        >
          <div
            className="bg-white p-6 
        w-[95vw] md:w-[70vw] lg:w-[45%]
        max-h-[90vh]
        
        overflow-hidden
        flex flex-col  overflow-y-auto
        rounded-lg
        shadow-lg"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()} 
          >
            <h3 className="text-lg font-semibold mb-4 text-center">
                 Customer Quotation Preview
            </h3>

             <div onWheel={(e) => e.stopPropagation()}  className="space-y-2 text-sm"> 
            <p><strong>Name:</strong> {capitalizeWords(viewApp.name)}</p>
            <p>
              <strong>Email:</strong>{" "}
              <a
                href={`mailto:${viewApp.email}`}
                className="text-blue-600 hover:underline"
              >
                {viewApp.email}
              </a>
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              <a
                href={`tel:${viewApp.phone}`}
                className="text-blue-600 hover:underline"
              >
                {viewApp.phone}
              </a>
            </p>

            <p><strong>Service:</strong> {capitalizeWords(viewApp.serviceCalculator)}</p>
            <p>
  <strong>Total:</strong> ₹{Number(viewApp?.finalPrice || 0).toLocaleString("en-IN")}
</p>


             {/* QUOTATION */}
        <div className="mt-5 ">
          <h5 className="font-semibold mb-2">Quotation:</h5>

          <div className="bg-gray-50 rounded-lg border">
            {viewApp.quote.map((q, i) => (
              <div
                key={i}
                className="flex justify-between gap-4 px-4 py-3 border-b last:border-b-0"
              >
                <div>
                  <p className="font-semibold capitalize">
                    <p className="font-semibold capitalize">
  {capitalizeWords(q.type)} – {capitalizeWords(q.label)}
</p>

                  </p>
                  <p className="text-gray-600 capitalize">
                    {capitalizeWords(q.value)}
                  </p>
                </div>

                <div className="font-semibold text-right whitespace-nowrap">
                 ₹{Number(q.price || 0).toLocaleString("en-IN")}

                </div>
              </div>
            ))}
          </div>
        </div>
</div>
            <button
              onClick={() => setViewApp(null)}
              className="mt-5 w-full bg-gray-800 text-white py-2 rounded cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {loading && <p className="mt-4">Loading...</p>}



       {/* EXPORT POPUP */}
            {showExportRange && (
              <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                onClick={() => setShowExportRange(false)}
              >
                 
                <div
                  className="bg-white p-4 rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                   <h4 className="font-semibold mb-3 text-center">
              Select Date Range to Export CSV
            </h4>
                  <div className="flex justify-center items-center w-full">
                  <DateRange
                    ranges={exportRange}
                    onChange={(ranges:any) =>
                      setExportRange([{ ...ranges.export!, key: "export" }])
                    }
                  />
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={handleExportCSV}
                      className="flex-1 bg-gray-800 text-white px-4 py-2 rounded cursor-pointer"
                    >
                      Export
                    </button>
                    <button
                      onClick={() => setShowExportRange(false)}
                      className="flex-1 border px-4 py-2 rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
}
