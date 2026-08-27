"use client";

import { useEffect, useRef, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { ChevronDown } from "lucide-react"; // 🔹 for dropdown arrows

type CareerApp = {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  cvUrl: string;
  portfolio: string;
  message: string;
  availability: string;
  createdAt?: { seconds: number };
  role?: string; // Added optional role field
};

type DateRangeState = {
  startDate?: Date;
  endDate?: Date;
  key: string;
};

export default function CareerApplications() {
  const [applications, setApplications] = useState<CareerApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<CareerApp[]>([]);
  const [loading, setLoading] = useState(true);
const tableScrollRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [open, setOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
const appsPerPage = 100;
 
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

const [exportRange, setExportRange] = useState([
  {
    startDate: undefined,
    endDate: undefined,
    key: "export",
  },
]);

  const [showExportRange, setShowExportRange] = useState(false);
  const [viewApp, setViewApp] = useState<CareerApp | null>(null); // 🔹 for View popup
  const dateRef = useRef<HTMLDivElement>(null);

  // Close date picker on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const q = query(
          collection(db, "careerApplications"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const apps: CareerApp[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(), 
        })) as CareerApp[];
        setApplications(apps);
        setFilteredApps(apps);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = applications;
    const { startDate, endDate } = dateRange[0];

    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.name.toLowerCase().includes(lower) ||
          app.jobTitle.toLowerCase().includes(lower) ||
          app.phone.includes(searchTerm) ||
          app.availability.toLowerCase().includes(lower)
      );
    }

   if (startDate && endDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0); // start of day

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // end of day

  filtered = filtered.filter((app) => {
    if (!app.createdAt) return false;
    const appDate = new Date(app.createdAt.seconds * 1000);
    return appDate >= start && appDate <= end;
  });
}


    if (selectedJob !== "") {
      filtered = filtered.filter((app) => app.jobTitle === selectedJob);
    }

    setFilteredApps(filtered);
  }, [applications, searchTerm, selectedJob, dateRange]);

  const jobTitles = [...new Set(applications.map((app) => app.jobTitle))];


  const capitalize = (value?: string) =>
  value
    ? value
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "";

const formatDateDDMMYYYY = (seconds: number) => {
  const d = new Date(seconds * 1000);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateFromDateObj = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};


  // 🔹 Export CSV by inline date range
const handleExportCSV = () => {
  let dataToExport = [...applications];

  // -----------------------------
  // 1️⃣ Apply Search Filter
  // -----------------------------
  if (searchTerm.trim() !== "") {
    const lower = searchTerm.toLowerCase();
    dataToExport = dataToExport.filter(
      (app) =>
        app.name.toLowerCase().includes(lower) ||
        app.jobTitle.toLowerCase().includes(lower) ||
        app.phone.includes(searchTerm) ||
        app.availability.toLowerCase().includes(lower)
    );
  }

  // -----------------------------
  // 2️⃣ Apply Job Filter
  // -----------------------------
  if (selectedJob !== "") {
    dataToExport = dataToExport.filter(
      (app) => app.jobTitle === selectedJob
    );
  }

  // -----------------------------
  // 3️⃣ Apply Inline Date Filter
  // -----------------------------
  const { startDate, endDate } = dateRange[0] || {};

  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    dataToExport = dataToExport.filter((app) => {
      if (!app.createdAt?.seconds) return false;
      const appDate = new Date(app.createdAt.seconds * 1000);
      return appDate >= start && appDate <= end;
    });
  }

  // -----------------------------
  // 4️⃣ Apply Export Popup Date
  // -----------------------------


  
const exportStart = exportRange[0]?.startDate;
const exportEnd = exportRange[0]?.endDate;

if (exportStart && exportEnd) {
    const start = new Date(exportStart);
    start.setHours(0, 0, 0, 0);

    const end = new Date(exportEnd);
    end.setHours(23, 59, 59, 999);

    dataToExport = dataToExport.filter((app) => {
      if (!app.createdAt?.seconds) return false;
      const appDate = new Date(app.createdAt.seconds * 1000);
      return appDate >= start && appDate <= end;
    });
  }

  // -----------------------------
  // 5️⃣ Safety Check
  // -----------------------------
  if (!dataToExport.length) {
    alert("No applications found for selected filters.");
    return;
  }

  // -----------------------------
  // 6️⃣ Build CSV
  // -----------------------------
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [
      [
        "Name",
        "Email",
        "Phone",
        "Job Title",
        "Availability",
        "CV URL",
        "Portfolio",
        "Message",
        "Date",
      ].join(","),

      ...dataToExport.map((app) =>
        [
          `"${capitalize(app.name)}"`,
          `"${app.email}"`,
          `"${app.phone}"`,
          `"${capitalize(app.jobTitle)}"`,
          `"${capitalize(app.availability)}"`,
          `"${app.cvUrl || ""}"`,
          `"${app.portfolio || ""}"`,
          `"${capitalize(app.message?.replace(/\n/g, " ") || "")}"`,
          `"${
            app.createdAt
              ? formatDateDDMMYYYY(app.createdAt.seconds)
              : ""
          }"`,
        ].join(",")
      ),
    ].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
    // -------- Filename Logic ----------
  const parts: string[] = ["Career Applications"];



  // Inline filter date (table filter)
const inlineStart = dateRange[0]?.startDate;
const inlineEnd = dateRange[0]?.endDate;

if (inlineStart && inlineEnd) {
  parts.push(
    `${formatDateFromDateObj(inlineStart)} to ${formatDateFromDateObj(inlineEnd)}`
  );
}

// Export popup date
const exportStartName = exportRange[0]?.startDate;
const exportEndName = exportRange[0]?.endDate;

if (exportStartName && exportEndName) {
  parts.push(
    `${formatDateFromDateObj(exportStartName)} to ${formatDateFromDateObj(exportEndName)}`
  );
} 

  if (selectedJob) {
    parts.push(capitalize(selectedJob));
  }

  if (searchTerm.trim()) {
    parts.push(`Search-${searchTerm.trim().replace(/\s+/g, "_")}`);
  }

  // const { startDate, endDate } = dateRange[0];
  if (startDate && endDate) {
    parts.push(
      `${formatDateFromDateObj(startDate)} to ${formatDateFromDateObj(
        endDate
      )}`
    );
  }

  const fileName = parts.join(" - ") + ".csv";
   link.setAttribute("download", fileName);
   
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};






  return (
    <div className=" relative">
      <h3 className=" font-semibold mb-5">Career Applications</h3>

      {/* Name, Position, Phone or Availability Filters */}
      {/* Filters */}
<div className="flex flex-col gap-4 mb-5 w-full">

  {/* Row */}
  <div className="flex flex-wrap items-center gap-3 w-full">

    {/* 🔍 Search */}
    <input
      type="text"
      placeholder="Search by Name, Position, Phone Or Availability..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="
        border rounded-lg px-3 py-2
        flex-[2] min-w-[220px] max-w-full
        focus:outline-none text-base text-black
      "
    />

    {/* 📅 Date Filter */}
    <div
      className="relative flex-[1.5] min-w-[220px]"
      ref={dateRef}
    >
      <div
  onClick={() => setOpen(!open)}
  className="
    relative w-full
    border rounded-lg
    px-4 py-2
    cursor-pointer
    flex items-center
    bg-white
    focus-within:ring-1 focus-within:ring-gray-300
  "
>
  {/* Text */}
  <span className="flex-1 truncate text-base text-black">
    {dateRange[0].startDate
      ? dateRange[0].endDate
        ? `${dateRange[0].startDate.toDateString()} → ${dateRange[0].endDate.toDateString()}`
        : dateRange[0].startDate.toDateString()
      : "Filter By Date"}
  </span>

  {/* Chevron */}
  <ChevronDown className="w-4 h-4 text-black ml-2" />
</div>


      {open && (
        <div className="absolute z-50 mt-1 bg-white shadow-lg rounded-lg">
          <DateRange
            editableDateInputs
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            onChange={(item: any) => {
              if (item.selection) {
                const { startDate, endDate } = item.selection;
                setDateRange([
                  {
                    startDate: startDate ?? undefined,
                    endDate: endDate ?? startDate ?? undefined,
                    key: "selection",
                  },
                ]);
              }
            }}
          />
        </div>
      )}
    </div>

    {/* 🎯 Job Filter */}
    <div className="relative flex-[1] min-w-[180px]">
      <select
        value={selectedJob}
        onChange={(e) => setSelectedJob(e.target.value)}
        className="
          appearance-none border rounded-lg
          px-4 py-2 pr-10 w-full cursor-pointer
          focus:outline-none text-base text-black
        "
      >
        <option value="">All Job Titles</option>
        {jobTitles.map((title, idx) => (
          <option key={idx} value={title}>
            {title}
          </option>
        ))}
      </select>

      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-black pointer-events-none" />
    </div>

    {/* 📤 Export CSV */}
      <div className=" flex-shrink-0 flex flex-col gap-2">
            <button
              onClick={() => setShowExportRange(!showExportRange)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer"
            >
              Export CSV
            </button>

            {showExportRange && (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 z-50"
    onClick={() => setShowExportRange(false)}
  >
    <div
      className="bg-white shadow-lg border rounded-lg p-4 w-auto relative flex flex-col items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <h4 className="font-semibold mb-3 text-center">
        Select Date Range to Export CSV
      </h4>

      {/* Centered Date Range Picker */}
      <div className="flex justify-center items-center w-full">
         <DateRange
        editableDateInputs
        moveRangeOnFirstSelection={false}
        ranges={exportRange}
        onChange={(ranges : any) => {
          const selection = ranges.export || ranges.selection;
          if (selection) {
            setExportRange([
              {
                startDate: selection.startDate ?? undefined,
                endDate: selection.endDate ?? undefined,
                key: "export",
              },
            ]);
          }
        }}
      />
      </div>

      <div className="flex gap-3 mt-4 w-full">
        <button
          onClick={handleExportCSV}
          className="flex-1 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer"
        >
          Export
        </button>
        <button
          onClick={() => setShowExportRange(false)}
          className="flex-1 text-gray-600 border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

          </div>

  </div>
</div>


      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredApps.length === 0 ? (
        <p>No matching applications found.</p>
      ) : (
        
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
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Job Title</th>
                <th className="p-3 text-left">Availability</th>
                <th className="p-3 text-left">CV</th>
                <th className="p-3 text-left">Portfolio</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Message</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody >
              {currentApps.map((app) => (
                <tr key={app.id} className="border-t ">
                  <td className="p-3 capitalize">{app.name}</td>
                  <td className="p-3 ">
  <div className="flex flex-col">
    <a
      href={`mailto:${app.email}`}
      className=" text-blue-500 hover:underline"
    >
      {app.email}
    </a>

    <a
      href={`tel:${app.phone}`}
      className=" text-blue-500 hover:underline mt-1"
    >
      {app.phone}
    </a>
  </div>
</td>

                  <td className="p-3 capitalize">{app.jobTitle}</td>
                  <td className="p-3 capitalize">{app.availability}</td>
                  <td className="p-3">
                    {app.cvUrl ? (
                      <a href={app.cvUrl} target="_blank" className="text-blue-500 hover:underline">
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3 capitalize" >
                    {app.portfolio ? (
                      <a href={app.portfolio} target="_blank" className="text-blue-500 hover:underline">
                        Visit
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3 capitalize">
                    {app.createdAt
    ? (() => {
        const d = new Date(app.createdAt.seconds * 1000);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      })()
    : "—"}
                  </td>
                  <td className="p-3 max-w-[200px] truncate ">{app.message}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setViewApp(app)}
                      className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700 capitalize cursor-pointer"
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

      )}

      {/* 🔹 Popup Modal for View */}
      {viewApp && (
        <div
          className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setViewApp(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-[50%] h-auto max-h-[90%]  p-6 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-center">Application Details</h2>

            <div className="space-y-2 text-sm ">
              <p className="capitalize"><strong>Name:</strong> {viewApp.name}</p>
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

              <p className="capitalize"><strong>Job Title:</strong> {viewApp.jobTitle}</p>
              <p className="capitalize"><strong>Availability:</strong> {viewApp.availability}</p>
             <p className="capitalize">
  <strong>Date:</strong>{" "}
  {viewApp.createdAt
    ? new Date(viewApp.createdAt.seconds * 1000).toLocaleDateString("en-GB")
    : "—"}
</p>

              <p>
                <strong>CV:</strong>{" "}
                {viewApp.cvUrl ? (
                  <a href={viewApp.cvUrl} target="_blank" className="text-blue-600 hover:underline">
                    Open CV
                  </a>
                ) : (
                  "—"
                )}
              </p>
              <p>
                <strong>Portfolio:</strong>{" "}
                {viewApp.portfolio ? (
                  <a href={viewApp.portfolio} target="_blank" className="text-blue-600 hover:underline">
                    View Portfolio
                  </a>
                ) : (
                  "—"
                )}
              </p>
              <p ><strong>Message:</strong> {viewApp.message || "—"}</p>
            </div>

            <button
              onClick={() => setViewApp(null)}
              className="mt-5 w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
