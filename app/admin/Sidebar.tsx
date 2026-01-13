"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  ChevronDown,
  ChevronUp,
  LogOut,
  Mail,
  Building2,
  ClipboardList,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [careerOpen, setCareerOpen] = useState(false);
  const [calculatorOpen, setcalculatorOpen] = useState(false);


  const [careerCount, setCareerCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [contactCount, setContactCount] = useState(0);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  // 🔢 Fetch counts
useEffect(() => {
  const fetchCounts = async () => {
    try {
      const careerSnap = await getDocs(
        collection(db, "careerApplications")
      );
      const clientSnap = await getDocs(
        collection(db, "clientApplications")
      );
      const contactSnap = await getDocs(
        collection(db, "contactSubmissions") // ✅ FIXED
      );

      setCareerCount(careerSnap.size);
      setClientCount(clientSnap.size);
      setContactCount(contactSnap.size);
    } catch (error) {
      console.error("Error fetching sidebar counts:", error);
    }
  };

  fetchCounts();
}, []);


  return (
    <aside className="w-64 bg-black text-white h-screen fixed left-0 top-0 flex flex-col rounded-r-[20px]">
      <h3 className="p-4 font-bold border-b border-gray-800">Admin Panel</h3>

      <nav className="flex-1 p-3 space-y-1">
        {/* Dashboard */}
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
            pathname === "/admin"
              ? "bg-[var(--color-highlight)] text-black"
              : "hover:bg-gray-800"
          }`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        {/* Blogs */}
        <Link
          href="/admin/blogs"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
            pathname === "/admin/blogs"
              ? "bg-[var(--color-highlight)] text-black"
              : "hover:bg-gray-800"
          }`}
        >
          <FileText size={18} />
          Blogs
        </Link>

        {/* Careers */}
        <div className="space-y-1">
          <button
            onClick={() => setCareerOpen(!careerOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${
              pathname.startsWith("/admin/careers") ||
              pathname.startsWith("/admin/career-applications")
                ? "bg-[var(--color-highlight)] text-black"
                : "hover:bg-gray-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase size={18} />
              Careers
            </div>
            {careerOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {careerOpen && (
            <div className="ml-8 space-y-1">
              <Link
                href="/admin/careers"
                className={`block px-3 py-2 rounded-lg text-sm ${
                  pathname === "/admin/careers"
                    ? "bg-[var(--color-highlight)] text-black"
                    : "hover:bg-gray-800"
                }`}
              >
                Add Careers
              </Link>

              <Link
                href="/admin/career-applications"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                  pathname === "/admin/career-applications"
                    ? "bg-[var(--color-highlight)] text-black"
                    : "hover:bg-gray-800"
                }`}
              >
                <span>Manage Applications</span>

                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold ${
                    pathname === "/admin/career-applications"
                      ? "bg-black text-[var(--color-highlight)]"
                      : "bg-[var(--color-highlight)] text-black"
                  }`}
                >
                  {careerCount}
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Contact Applications */}
        <Link
          href="/admin/contact-applications"
          className={`flex items-center justify-between px-3 py-2 rounded-lg ${
            pathname === "/admin/contact-applications"
              ? "bg-[var(--color-highlight)] text-black"
              : "hover:bg-gray-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <Mail size={18} />
            Contact Applications
          </div>

          <span
            className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold ${
              pathname === "/admin/contact-applications"
                ? "bg-black text-[var(--color-highlight)]"
                : "bg-[var(--color-highlight)] text-black"
            }`}
          >
            {contactCount}
          </span>
        </Link>

        {/* Client Applications */}
        <Link
          href="/admin/client-applications"
          className={`flex items-center justify-between px-3 py-2 rounded-lg ${
            pathname === "/admin/client-applications"
              ? "bg-[var(--color-highlight)] text-black"
              : "hover:bg-gray-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <Building2 size={18} />
            Client Applications
          </div>

          <span
            className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold ${
              pathname === "/admin/client-applications"
                ? "bg-black text-[var(--color-highlight)]"
                : "bg-[var(--color-highlight)] text-black"
            }`}
          >
            {clientCount}
          </span>
        </Link>

  
        {/* Calculator */}
        <div className="space-y-1">
          <button
            onClick={() => setcalculatorOpen(!calculatorOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${
              pathname.startsWith("/admin/calculatorform") ||
              pathname.startsWith("/admin/allcalculator") ||
              pathname.startsWith("/admin/calculator-applications") 
                ? "bg-[var(--color-highlight)] text-black"
                : "hover:bg-gray-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase size={18} />
              Calculator
            </div>
            {calculatorOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {calculatorOpen && (
            <div className="ml-8 space-y-1">
              <Link
                href="/admin/calculatorform"
                className={`block px-3 py-2 rounded-lg text-sm ${
                  pathname === "/admin/calculatorform"
                    ? "bg-[var(--color-highlight)] text-black"
                    : "hover:bg-gray-800"
                }`}
              >
                Add Services
              </Link>

               <Link
                href="/admin/allcalculator"
                className={`block px-3 py-2 rounded-lg text-sm ${
                  pathname === "/admin/allcalculator"
                    ? "bg-[var(--color-highlight)] text-black"
                    : "hover:bg-gray-800"
                }`}
              >
                All Services
              </Link>

              <Link
                href="/admin/calculator-applications"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                  pathname === "/admin/calculator-applications"
                    ? "bg-[var(--color-highlight)] text-black"
                    : "hover:bg-gray-800"
                }`}
              >
                <span>Manage Applications</span>

                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold ${
                    pathname === "/admin/career-applications"
                      ? "bg-black text-[var(--color-highlight)]"
                      : "bg-[var(--color-highlight)] text-black"
                  }`}
                >
                  {careerCount}
                </span>
              </Link>
            </div>
          )}
        </div>


        {/* Users */}
        <Link
          href="/admin/users"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
            pathname === "/admin/users"
              ? "bg-[var(--color-highlight)] text-black"
              : "hover:bg-gray-800"
          }`}
        >
          <Users size={18} />
          Users
        </Link>
      </nav>

      {/* Logout */}
      <button
        onClick={() => setConfirm(true)}
        className="m-4 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-2 rounded-lg"
      >
        <LogOut size={16} /> Logout
      </button>

      {/* Logout Confirmation */}
      {confirm && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white text-black rounded-lg p-6 text-center space-y-4">
            <p className="font-semibold">Are you sure you want to logout?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
