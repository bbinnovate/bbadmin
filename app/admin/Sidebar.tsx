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
import { getAuth, onAuthStateChanged } from "firebase/auth";


interface SidebarProps { 
  onLogoutClick: () => void;
}

export default function Sidebar({ onLogoutClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [careerOpen, setCareerOpen] = useState(false);
  const [calculatorOpen, setcalculatorOpen] = useState(false);


  const [careerCount, setCareerCount] = useState(0);
  const [calculatorCount, setcalculatorCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [contactCount, setContactCount] = useState(0);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [role, setRole] = useState<string>("user");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);


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
        const calculatorSnap = await getDocs(
          collection(db, "calculatorApplications")
      );

      setCareerCount(careerSnap.size);
      setClientCount(clientSnap.size);
      setContactCount(contactSnap.size);
      setcalculatorCount(calculatorSnap.size);
    } catch (error) {
      console.error("Error fetching sidebar counts:", error);
    }
  };

  fetchCounts();
}, []);



useEffect(() => {
  const auth = getAuth();
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setCurrentUser(user);
    setAuthReady(true); // ✅ mark ready
  });

  return () => unsubscribe();
}, []);


useEffect(() => {
  const fetchMe = async () => {
    if (!currentUser) return;
    const snap = await getDocs(collection(db, "users"));
    const me = snap.docs.find(d => d.data().email === currentUser.email);

if (!me) return;

setRole(me.data().role || "user");
setPermissions(getEffectivePermissions(me.data().permissions));

  };

  fetchMe();
}, [currentUser]);

const canAccess = (key: string) => {
  if (role !== "admin") return false;

  return (
    permissions.includes("all") ||
    permissions.includes(key)
  );
};




const normalizePermissions = (p: any): string[] => {
  if (Array.isArray(p)) return p;
  if (p === "all") return ["all"];
  return [];
};

const getEffectivePermissions = (p: any): string[] => {
  const perms = normalizePermissions(p);
  return perms.length > 1 ? perms.filter(x => x !== "all") : perms;
};


  return (
    <aside className="w-66 bg-black text-white h-screen fixed left-0 top-0 flex flex-col rounded-r-[20px]">
      <h3 className="p-4 font-bold border-b border-gray-800">Admin Panel</h3>

      {authReady && (

      <nav className="flex-1 p-3 space-y-1">
        {/* Dashboard */}
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-2 py-2 rounded-lg text-[15px] ${
            pathname === "/admin"
              ? "bg-[var(--color-highlight)] text-black"
              : "hover:bg-gray-800"
          }`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        {/* Blogs */}
        {canAccess("blogs") && (
        <Link
  href="/admin/blogs"
  className={`flex items-center gap-3 px-2 py-2 rounded-lg text-[15px] ${
    pathname.startsWith("/admin/blogs")
      ? "bg-[var(--color-highlight)] text-black"
      : "hover:bg-gray-800"
  }`}
>
  <FileText size={18} />
  Blogs
</Link>
        )}

        {/* Careers */}
        {canAccess("career") && (
        <div className="space-y-1">
          <button
            onClick={() => setCareerOpen(!careerOpen)}
            className={`w-full flex items-center justify-between px-2 py-2 rounded-lg ${
              pathname.startsWith("/admin/careers") ||
              pathname.startsWith("/admin/career-applications")
                ? "bg-[var(--color-highlight)] text-black"
                : "hover:bg-gray-800"
            }`}
          >
            <div className="flex items-center gap-3 text-[15px]">
              <Briefcase size={18} />
              Careers
            </div>
            {careerOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {careerOpen && (
            <div className="ml-8 space-y-1">
              <Link
                href="/admin/career-categories"
                className={`block px-2 py-2 rounded-lg text-sm ${
                  pathname.startsWith("/admin/career-categories")
                    ? "bg-[var(--color-highlight)] text-black"
                    : "hover:bg-gray-800"
                }`}
              >
                Add Career Categories
              </Link>
              <Link
                href="/admin/careers"
                className={`block px-2 py-2 rounded-lg text-sm ${
                  pathname.startsWith("/admin/careers")
                    ? "bg-[var(--color-highlight)] text-black"
                    : "hover:bg-gray-800"
                }`}
              >
                Add Careers
              </Link>

              <Link
                href="/admin/career-applications"
                className={`flex items-center justify-between px-2 py-2 rounded-lg text-sm ${
                  pathname === "/admin/career-applications"
                    ? "bg-[var(--color-highlight)] text-black"
                    : "hover:bg-gray-800"
                }`}
              >
                <span>Manage Applications</span>

               <span
  className={`min-w-[36px] h-7 px-1 flex items-center justify-center rounded-full text-xs font-semibold whitespace-nowrap ${
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
        )}

        {/* Contact Applications */}
        {canAccess("contact") && (
        <Link
          href="/admin/contact-applications"
          className={`flex items-center justify-between px-2 py-2 rounded-lg ${
            pathname === "/admin/contact-applications"
              ? "bg-[var(--color-highlight)] text-black"
              : "hover:bg-gray-800"
          }`}
        >
          <div className="flex items-center gap-3 text-[15px]">
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
        )}

        {/* Client Applications */}
        {canAccess("clients") && (
        <Link
          href="/admin/client-applications"
          className={`flex items-center justify-between px-2 py-2 rounded-lg text-[15px] ${
            pathname === "/admin/client-applications"
              ? "bg-[var(--color-highlight)] text-black"
              : "hover:bg-gray-800"
          }`}
        >
          <div className="flex items-center gap-3 ">
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
        )}

  
        {/* Calculator */}
        {canAccess("calculator") && (
        <div className="space-y-1">
          <button
            onClick={() => setcalculatorOpen(!calculatorOpen)}
            className={`w-full flex items-center justify-between px-2 py-2 rounded-lg ${
              pathname.startsWith("/admin/calculatorform") ||
              pathname.startsWith("/admin/allcalculator") ||
              pathname.startsWith("/admin/calculator-applications") 
                ? "bg-[var(--color-highlight)] text-black"
                : "hover:bg-gray-800"
            }`}
          >
            <div className="flex items-center gap-3 text-[15px]">
              <Briefcase size={18} />
              Calculator
            </div>
            {calculatorOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {calculatorOpen && (
            <div className="ml-8 space-y-1">
              <Link
                href="/admin/calculatorform"
                className={`block px-2 py-2 rounded-lg text-sm ${
                  pathname === "/admin/calculatorform"
                    ? "bg-[var(--color-highlight)] text-black"
                    : "hover:bg-gray-800"
                }`}
              >
                Add Services
              </Link>

               <Link
                href="/admin/allcalculator"
                className={`block px-2 py-2 rounded-lg text-sm ${
                  pathname === "/admin/allcalculator"
                    ? "bg-[var(--color-highlight)] text-black"
                    : "hover:bg-gray-800"
                }`}
              >
                All Services
              </Link>

              <Link
                href="/admin/calculator-applications"
                className={`flex items-center justify-between px-2 py-2 rounded-lg text-sm ${
                  pathname === "/admin/calculator-applications"
                    ? "bg-[var(--color-highlight)] text-black"
                    : "hover:bg-gray-800"
                }`}
              >
                <span>Manage Applications</span>

                <span
                   className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold ${
                    pathname === "/admin/calculator-applications"
                      ? "bg-black text-[var(--color-highlight)]"
                      : "bg-[var(--color-highlight)] text-black"
                  }`}
                >
                  {calculatorCount}
                </span>
              </Link>
            </div>
          )}
        </div>
        )}


        {/* Users */}
        {canAccess("users") && (
        <Link
          href="/admin/users"
          className={`flex items-center gap-3 px-2 py-2 rounded-lg text-[15px] ${
            pathname === "/admin/users"
              ? "bg-[var(--color-highlight)] text-black"
              : "hover:bg-gray-800"
          }`}
        >
          <Users size={18} />
          Users
        </Link>
        )}
      </nav>

      )}

      {/* Logout */}
      <button
       onClick={onLogoutClick}
        className="m-4 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-2 rounded-lg"
      >
        <LogOut size={16} /> Logout
      </button>

     
    </aside>
  );
}
