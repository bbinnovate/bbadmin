import Sidebar from "./Sidebar";
import ProtectedRoute from "./ProtectedRoute";
import { Toaster } from "react-hot-toast";
import PageLoader from "../components/PageLoader";
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Bombay Blokes | Admin",
  description:
    "Access and manage all core operations of Bombay Blokes from the admin panel. Oversee blogs, users, career applications, analytics, scheduling, and content updates in one centralized dashboard.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 min-h-screen  min-w-0">
          <main className="p-6">
            <PageLoader>
              {/* <FallingFlowers /> */}
              {children}
            </PageLoader>
            <Toaster position="top-right" />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
