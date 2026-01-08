"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [careerForms, setCareerForms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Fetch Firestore data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogsSnap, formsSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, "blogs")),
          getDocs(collection(db, "careerApplications")),
          getDocs(collection(db, "users")),
        ]);

        setBlogs(blogsSnap.docs.map((d) => d.data()));
        setCareerForms(formsSnap.docs.map((d) => d.data()));
        setUsers(usersSnap.docs.map((d) => d.data()));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔸 Blogs per date (e.g., “4 Nov” → 4 blogs)
// ✅ Blogs per date using scheduledAt (NOT postedAt)
const blogsData = Object.values(
  blogs.reduce(
    (acc: Record<string, { name: string; value: number }>, blog) => {
      const ts = blog.scheduledAt || blog.postedAt; 
      // ✅ fallback only if old blogs still have postedAt

      if (!ts?.seconds) return acc;

      const date = new Date(ts.seconds * 1000).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" }
      );

      if (!acc[date]) acc[date] = { name: date, value: 0 };
      acc[date].value += 1;

      return acc;
    },
    {}
  )
).sort(
  (a: any, b: any) =>
    new Date(a.name).getTime() - new Date(b.name).getTime()
);



  // 🔸 Users by Role
  const usersPieData = users.map((u, i) => ({
    name: u.role || `User ${i + 1}`,
    value: 1,
  }));

  // 🔸 Career Form Submissions by Date
  const formsLineData = Object.values(
    careerForms.reduce(
      (acc: Record<string, { name: string; value: number }>, form) => {
        if (!form.createdAt?.seconds) return acc;
        const date = new Date(form.createdAt.seconds * 1000).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric" }
        );
        if (!acc[date]) acc[date] = { name: date, value: 0 };
        acc[date].value += 1;
        return acc;
      },
      {}
    )
  );

  const COLORS = [
    "#3b82f6",
    "#22c55e",
    "#eab308",
    "#ef4444",
    "#8b5cf6",
    "#f97316",
    "#0ea5e9",
  ];

  return (
    <div className="p-8 bg-white rounded-lg shadow text-black">
      <h3 className="text-2xl font-semibold mb-4">Welcome, Admin!</h3>
      <p className="text-gray-600 mb-8">
        Overview of Blogs, Career Applications, and Users
      </p>

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* 🟦 Blogs (Bar Chart by Date) */}
          <div className="bg-[#ffffff] p-5 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Blogs </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={blogsData}>
                <XAxis dataKey="name" stroke="black" />
                <YAxis stroke="black" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1D1D1B",
                    border: "none",
                    borderRadius: "0.5rem",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#fff" }}
                  cursor={{ fill: "rgba(255,255,255,0.1)" }}
                />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 🟩 Users (Pie Chart) */}
          <div className="bg-[#ffffff] p-5 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usersPieData}
                  dataKey="value"
                  outerRadius={100}
                  label={(entry) => entry.name}
                >
                  {usersPieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1D1D1B",
                    border: "none",
                    borderRadius: "0.5rem",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#fff" }}
                  cursor={{ fill: "rgba(255,255,255,0.1)" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 🟧 Career Forms (Line Chart) */}
          <div className="bg-[#ffffff] p-5 rounded-2xl shadow-lg col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Career Form Submissions</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formsLineData}>
                <XAxis dataKey="name" stroke="black" />
                <YAxis stroke="black" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1D1D1B",
                    border: "none",
                    borderRadius: "0.5rem",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}
