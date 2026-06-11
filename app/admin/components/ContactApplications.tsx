"use client";

import { useEffect, useRef, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DateRange } from "react-date-range";
import { ChevronDown } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { deleteDoc, doc } from "firebase/firestore";

type ContactApp = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  services: string[];
  message: string;
  createdAt?: { seconds: number };
};

type DateRangeState = {
  startDate?: Date;
  endDate?: Date;
  key: string;
};


export default function ContactApplications() {
  const [applications, setApplications] = useState<ContactApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<ContactApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [open, setOpen] = useState(false);

  const [viewApp, setViewApp] = useState<ContactApp | null>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  const tableRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
const appsPerPage = 50;
 
const indexOfLast = currentPage * appsPerPage;
const indexOfFirst = indexOfLast - appsPerPage;
const currentApps = filteredApps.slice(indexOfFirst, indexOfLast);

const totalPages = Math.ceil(filteredApps.length / appsPerPage);

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages) setCurrentPage(page);
};


  const [dateRange, setDateRange] = useState<DateRangeState[]>([
    { startDate: undefined, endDate: undefined, key: "selection" },
  ]);

  // Export CSV popup

  const [showExportRange, setShowExportRange] = useState(false);
const [exportRange, setExportRange] = useState<DateRangeState[]>([
  { startDate: undefined, endDate: undefined, key: "export" },
]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const q = query(
        collection(db, "contactSubmissions"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ContactApp[];

      setApplications(data);
      setFilteredApps(data);
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

  // Filters
  useEffect(() => {
    let filtered = applications;
    const { startDate, endDate } = dateRange[0];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(lower) ||
          a.email.toLowerCase().includes(lower) ||
          a.phone.includes(searchTerm)
      );
    }

    if (startDate && endDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);

      filtered = filtered.filter((a) => {
        if (!a.createdAt) return false;
        const d = new Date(a.createdAt.seconds * 1000);
        return d >= s && d <= e;
      });
    }

   // Service filter (FIXED)
if (selectedService) {
  const selected = selectedService.toLowerCase();

  filtered = filtered.filter((a) =>
    a.services?.some((service) =>
      service.toLowerCase().includes(selected)
    )
  );
}


    setFilteredApps(filtered);
  }, [searchTerm, dateRange, selectedService, applications]);

  const allServices = [
    ...new Set(applications.flatMap((a) => a.services || [])),
  ];


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

  // CSV Export (same logic as career)
const handleExportCSV = () => {
  let dataToExport = [...filteredApps];

  if (!dataToExport.length) {
    alert("No records found for current filters");
    return;
  }

  // -----------------------------
  // 1️⃣ Apply Export Popup Date Filter (if properly selected)
  // -----------------------------
  const exportStart = exportRange[0]?.startDate;
  const exportEnd = exportRange[0]?.endDate;

  let hasExportDate = false;

  if (
    exportStart instanceof Date &&
    exportEnd instanceof Date &&
    !isNaN(exportStart.getTime()) &&
    !isNaN(exportEnd.getTime())
  ) {
    hasExportDate = true;

    const start = new Date(exportStart);
    start.setHours(0, 0, 0, 0);

    const end = new Date(exportEnd);
    end.setHours(23, 59, 59, 999);

    const filteredByExportDate = dataToExport.filter((a) => {
      if (!a.createdAt?.seconds) return false;
      const d = new Date(a.createdAt.seconds * 1000);
      return d >= start && d <= end;
    });

    // Only apply if it actually returns results
    if (filteredByExportDate.length > 0) {
      dataToExport = filteredByExportDate;
    }
    // If zero results, DO NOT block export.
    // Just export current filteredApps instead.
  }

  // -----------------------------
  // 2️⃣ Build CSV
  // -----------------------------
  const csv =
    "Name,Email,Phone,Company,Services,Message,Date\n" +
    dataToExport
      .map((a) =>
        [
          capitalizeWords(a.name),
          a.email,
          a.phone,
          capitalizeWords(a.company || "-"),
          capitalizeWords(a.services?.join(", ") || ""),
          capitalizeWords(a.message?.replace(/\n/g, " ") || ""),
          a.createdAt
            ? new Date(a.createdAt.seconds * 1000).toLocaleDateString("en-GB")
            : "",
        ]
          .map((v) => `"${v}"`)
          .join(",")
      )
      .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);

  // -----------------------------
  // 3️⃣ Filename Logic
  // -----------------------------
  const parts: string[] = ["Contact Applications"];

  if (selectedService.trim()) {
    parts.push(capitalizeWords(selectedService));
  }

  if (searchTerm.trim()) {
    parts.push(`Search-${searchTerm.trim().replace(/\s+/g, "_")}`);
  }

  const getMinMaxDates = (apps: ContactApp[]) => {
    const dates = apps
      .filter((a) => a.createdAt?.seconds)
      .map((a) => a.createdAt!.seconds * 1000);

    if (!dates.length) return null;

    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));

    return {
      minLabel: formatDDMMYYYY(min),
      maxLabel: formatDDMMYYYY(max),
    };
  };

// 1️⃣ If export popup date is selected → use that
if (hasExportDate && exportStart && exportEnd) {
  parts.push(
    `${formatDDMMYYYY(exportStart)} to ${formatDDMMYYYY(exportEnd)}`
  );
}

// 2️⃣ Else if filter date (top dateRange) is selected → use THAT
else if (dateRange[0]?.startDate && dateRange[0]?.endDate) {
  parts.push(
    `${formatDDMMYYYY(dateRange[0].startDate)} to ${formatDDMMYYYY(
      dateRange[0].endDate
    )}`
  );
}

// 3️⃣ Else fallback to content range
else {
  const range = getMinMaxDates(dataToExport);
  if (range) {
    parts.push(`${range.minLabel} to ${range.maxLabel}`);
  }
}

  const fileName = `${parts.join(" - ")}.csv`;

  link.download = fileName;
  link.click();
};

const toggleSelect = (id: string) => {
  setSelectedIds((prev) =>
    prev.includes(id)
      ? prev.filter((item) => item !== id)
      : [...prev, id]
  );
};

const handleDeleteSelected = async () => {
  if (!selectedIds.length) {
    alert("Please select records");
    return;
  }

  const confirmDelete = window.confirm(
    `Delete ${selectedIds.length} selected record(s)?`
  );

  if (!confirmDelete) return;

  try {
    await Promise.all(
      selectedIds.map((id) =>
        deleteDoc(doc(db, "contactSubmissions", id))
      )
    );

    const updated = applications.filter(
      (app) => !selectedIds.includes(app.id)
    );

    setApplications(updated);
    setFilteredApps(updated);
    setSelectedIds([]);

    alert("Deleted successfully");
  } catch (error) {
    console.error(error);
    alert("Failed to delete records");
  }
};


  return (
    <div className="relative">
      <h3 className="text-xl font-semibold mb-5">Contact Applications</h3>

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
        appearance-none cursor-pointer text-base text-black
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

      <div className="flex gap-2">
  <button
    onClick={() => setShowExportRange(true)}
    className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer"
  >
    Export CSV
  </button>

  {/* <button
    onClick={handleDeleteSelected}
    className="bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer"
  >
    Delete Selected
  </button> */}
</div>
      </div>

      {/* Table */}
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
              {/* <th className="p-3 text-left">
  <input
    type="checkbox"
    checked={
      currentApps.length > 0 &&
      currentApps.every((app) =>
        selectedIds.includes(app.id)
      )
    }
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedIds([
          ...new Set([
            ...selectedIds,
            ...currentApps.map((a) => a.id),
          ]),
        ]);
      } else {
        setSelectedIds(
          selectedIds.filter(
            (id) =>
              !currentApps.some((a) => a.id === id)
          )
        );
      }
    }}
  />
</th> */}
              <th className="p-3 text-left">SR No.</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Contact</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Services</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Message</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
           {currentApps.map((a,i) => (
              <tr key={a.id} className="border-t">
                {/* <td className="p-3">
  <input
    type="checkbox"
    checked={selectedIds.includes(a.id)}
    onChange={() => toggleSelect(a.id)}
  />
</td> */}
                 <td className="p-3 capitalize">{indexOfFirst + i + 1}</td>
                <td className="p-3 capitalize">{a.name}</td>
                

<td className="p-3 ">
  <div className="flex flex-col">
    <a
      href={`mailto:${a.email}`}
      className=" text-blue-500 hover:underline"
    >
       {a.email}
    </a>

    <a
      href={`tel:${a.phone}`}
      className=" text-blue-500 hover:underline mt-1"
    >
      {a.phone}
    </a>
  </div>
</td>

        
                <td className="p-3 capitalize">{a.company || "-"}</td>
               <td className="p-3 capitalize">
  <div className="space-y-1">
    {a.services
      ?.reduce<string[][]>((rows, service, index) => {
        if (index % 2 === 0) rows.push([]);
        rows[rows.length - 1].push(service);
        return rows;
      }, [])
      .map((row, idx) => (
        <div key={idx}>{row.join(", ")}</div>
      ))}
  </div>
</td>

                <td className="p-3">
                  {a.createdAt
                    ? new Date(a.createdAt.seconds * 1000).toLocaleDateString(
                        "en-GB"
                      )
                    : "-"}
                </td>
                <td className="p-3 max-w-[220px] truncate ">{a.message || "No Message "}</td>
                <td className="p-3">
                  <button
                    onClick={() => setViewApp(a)}
                    className="bg-gray-800 text-white px-3 py-1 rounded   cursor-pointer"
                  >
                    View
                  </button>
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

      {loading && <p className="mt-4">Loading...</p>}

      {/* VIEW MODAL */}
      {viewApp && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setViewApp(null)}
        >
          <div
            className="bg-white rounded-lg p-6 w-[45%]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-center">
              Contact Details
            </h3>

            <div className="space-y-2 text-sm">
              <p className="capitalize" ><strong>Name:</strong> {viewApp.name}</p>
               <p >
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
              <p className="capitalize" ><strong>Company:</strong> {viewApp.company || "-"}</p>
              <p className="capitalize" ><strong>Services:</strong> {viewApp.services.join(", ")}</p>
              <p  ><strong>Message:</strong> {viewApp.message || "No Message "}</p>
              <p>
                <strong>Date:</strong>{" "}
                {viewApp.createdAt
                  ? new Date(
                      viewApp.createdAt.seconds * 1000
                    ).toLocaleDateString("en-GB")
                  : "-"}
              </p>
            </div>

            <button
              onClick={() => setViewApp(null)}
              className="mt-5 w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700  cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

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
