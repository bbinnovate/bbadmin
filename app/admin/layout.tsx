"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import ProtectedRoute from "./ProtectedRoute";
import { Toaster } from "react-hot-toast";
import PageLoader from "../components/PageLoader";
import { logout } from "@/lib/auth";
import { LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar onLogoutClick={() => setConfirm(true)} />

        <div className="flex-1 ml-64 min-h-screen min-w-0">
          <main className="p-6">
            <PageLoader>{children}</PageLoader>

            {confirm && (
              <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white w-[380px] rounded-2xl shadow-2xl p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-red-100 p-4 rounded-full">
                      <LogOut className="text-red-600 w-8 h-8" />
                    </div>
                  </div>

                  <h5 className="text-lg font-semibold text-gray-800">
                    Confirm Logout
                  </h5>

                  <p className="text-gray-500 text-sm mt-2">
                    Are you sure you want to logout?
                  </p>

                  <div className="flex justify-center gap-4 mt-6">
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white px-5 py-2 rounded-lg"
                    >
                      Yes, Logout
                    </button>

                    <button
                      onClick={() => setConfirm(false)}
                      className="bg-gray-200 px-5 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <Toaster position="top-right" />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}