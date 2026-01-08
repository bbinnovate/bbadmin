"use client";

import { useEffect, useRef, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DateRange, Range } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { ChevronDown } from "lucide-react";

type ClientApp = {
  id: string;
  companyName: string;
  brandName?: string;
  industry: string;
  gstin?: string;
  services: string[];
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  website?: string;
  createdAt?: { seconds: number };
};

export default function ClientApplications() {
  const [applications, setApplications] = useState<ClientApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<ClientApp[]>([]);
  const [viewApp, setViewApp] = useState<ClientApp | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [open, setOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
const tableScrollRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(1);
const appsPerPage = 50;
 
const indexOfLast = currentPage * appsPerPage;
const indexOfFirst = indexOfLast - appsPerPage;
const currentApps = filteredApps.slice(indexOfFirst, indexOfLast);

const totalPages = Math.ceil(filteredApps.length / appsPerPage);

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages) setCurrentPage(page);
};

  const [dateRange, setDateRange] = useState<Range[]>([
    { startDate: undefined, endDate: undefined, key: "selection" },
  ]);
  // Export CSV popup
  const today = new Date();
  const [showExportRange, setShowExportRange] = useState(false);
  const [exportRange, setExportRange] = useState<Range[]>([
    { startDate: today, endDate: today, key: "export" },
  ]);

  // 📥 Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const q = query(
        collection(db, "clientApplications"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ClientApp[];

      setApplications(data);
      setFilteredApps(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  // 🔍 Filters
  useEffect(() => {
    let filtered = applications;
    const { startDate, endDate } = dateRange[0];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.companyName.toLowerCase().includes(lower) ||
          a.brandName?.toLowerCase().includes(lower) ||
          a.contactPerson.toLowerCase().includes(lower) ||
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

if (selectedService) {
  const selected = selectedService.toLowerCase();

  filtered = filtered.filter((a) =>
    a.services?.some((service) =>
      service.toLowerCase().includes(selected)
    )
  );
}

    setFilteredApps(filtered);
  }, [applications, searchTerm, selectedService, dateRange]);

  const allServices = [
    ...new Set(applications.flatMap((a) => a.services || [])),
  ];

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dateRef.current &&
      !dateRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


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
    const { startDate, endDate } = exportRange[0];
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filtered = applications.filter((a) => {
      if (!a.createdAt) return false;
      const d = new Date(a.createdAt.seconds * 1000);
      return d >= start && d <= end;
    });

    if (!filtered.length) {
      alert("No records found for selected date range");
      return;
    }

    const csv =
      "Company Name,Brand Name,Contact Person,Email,Phone,Services,Industry,GSTIN,Address,Website,Date\n" +
      filtered
        .map((a) =>
         [
  capitalizeWords(a.companyName),
  capitalizeWords(a.brandName || "-"),
  capitalizeWords(a.contactPerson?.replace(/\n/g, " ")),
  a.email,
  a.phone,
  capitalizeWords(a.services?.join(", ")),
  capitalizeWords(a.industry || "-"),
  capitalizeWords(a.gstin || "-"),
  capitalizeWords(a.address || "-"),
  capitalizeWords(a.website || "-"),
  new Date(a.createdAt!.seconds * 1000).toLocaleDateString("en-GB"),
]

            .map((v) => `"${v}"`)
            .join(",")
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
   link.download = `Client Applications ${formatDDMMYYYY(start)} to ${formatDDMMYYYY(end)}.csv`;
    link.click();
  };

  return (
    <div className="relative">
      <h3 className="text-xl font-semibold mb-5">Client Applications</h3>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Search company, brand, contact, email or phone"
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
          : "Filter by Date"}
      </span>
      <ChevronDown className="w-4 h-4 text-black" />
    </div>

    {open && (
      <div className="absolute z-50 bg-white shadow rounded-lg mt-1">
        <DateRange
          ranges={dateRange}
          onChange={(item) =>
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

        <button
          onClick={() => setShowExportRange(true)}
          className="bg-black text-white px-4 py-2 rounded-lg  cursor-pointer"
        >
          Export CSV
        </button>
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
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Brand</th>
              <th className="p-3 text-left">Services</th>

              <th className="p-3 text-left">Contact Person</th>
              

              
              <th className="p-3 text-left">Website</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {currentApps.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3 capitalize">{a.companyName}</td>
                <td className="p-3 capitalize">{a.brandName || "-"}</td>
                <td className="p-3">{a.services.join(", ")}</td>
                <td className="p-3">
  <div className="flex flex-col gap-1">
    <span className="capitalize">{a.contactPerson}</span>

    <a
      href={`mailto:${a.email}`}
      className="text-blue-600 hover:underline"
    >
      {a.email}     
    </a>

    <a
      href={`tel:${a.phone}`}
      className="text-blue-600 hover:underline"
    >
      {a.phone}
    </a>
  </div>
</td>

                <td className="p-3">
                  {a.website ? (
                    <a
                      href={a.website}
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      Visit
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-3">
                  {a.createdAt
                    ? new Date(a.createdAt.seconds * 1000).toLocaleDateString(
                        "en-GB"
                      )
                    : "-"}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => setViewApp(a)}
                    className="bg-gray-800 text-white px-3 py-1 rounded cursor-pointer"
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
            className="bg-white rounded-lg p-6 w-[55%]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-center">
              Client Details
            </h3>

            <div className="space-y-2 text-sm">
              <p className="capitalize" ><strong>Company Name:</strong> {viewApp.companyName}</p>
              <p className="capitalize" ><strong>Brand Name:</strong> {viewApp.brandName || "-"}</p>
              <p className="capitalize" ><strong>Industry:</strong> {viewApp.industry}</p>
              <p className="capitalize" ><strong>GSTIN:</strong> {viewApp.gstin || "-"}</p>
              <p className="capitalize" ><strong>Services:</strong> {viewApp.services.join(", ")}</p>
              <p className="capitalize" ><strong>Contact Person:</strong> {viewApp.contactPerson}</p>
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
              <p className="capitalize" ><strong>Address:</strong> {viewApp.address || "-"}</p>
             <p>
  <strong>Website:</strong>{" "}
  {viewApp.website ? (
    <a
  href={viewApp.website.startsWith("http") ? viewApp.website : `https://${viewApp.website}`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-blue-600 hover:underline"
>
  {viewApp.website}
</a>

  ) : (
    "-"
  )}
</p>

            </div>

            <button
              onClick={() => setViewApp(null)}
              className="mt-5 w-full bg-gray-800 text-white py-2 rounded-lg cursor-pointer"
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
              onChange={(ranges) =>
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
