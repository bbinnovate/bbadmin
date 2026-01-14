"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";

type UserType = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string | { seconds: number; nanoseconds: number };
};

const Users = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList: UserType[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
          };
        }) as UserType[];
        setUsers(usersList);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle role change
  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", id), { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
      toast.success(`Role updated to "${newRole}"`);
    } catch (error) {
      console.error(error);
      toast.error("Error updating role.");
    }
  };

  // Delete user
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteDoc(doc(db, "users", id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted!");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting user.");
    }
  };

  if (loading) return <p className="text-center py-10">Loading users...</p>;

  return (
    <div className="p-6">
      <h3 className="text-2xl font-semibold mb-6">User Management</h3>

      <div className="overflow-x-auto border rounded-lg shadow">
        <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-6 py-3 text-left">SR No.</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Date Joined</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 border-t">
            {users.map((user) => {
              // FORMAT DATE → DD/MM/YYYY
              let joinedDate = "—";
              if (user.createdAt) {
                if (typeof user.createdAt === "string") {
                  joinedDate = new Date(user.createdAt).toLocaleDateString("en-GB");
                } else if ("seconds" in user.createdAt) {
                  joinedDate = new Date(
                    user.createdAt.seconds * 1000
                  ).toLocaleDateString("en-GB");
                }
              }

              return (
                
               <tr key={user.id} className="border-b border-black last:border-b-0">
                  <td className="px-6 py-3 ">{users.indexOf(user) + 1}</td>
                  <td className="px-6 py-3 capitalize">{user.name || "—"}</td>
                  <td className="px-6 py-3">{user.email}</td>
                  <td className="px-6 py-3 capitalize">{joinedDate}</td>

                  {/* FIXED DROPDOWN UI */}
                  <td className="px-6 py-3">
                    <div className="relative w-32">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm capitalize appearance-none pr-10"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>

                      {/* Dropdown Arrow */}
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                    </div>
                  </td>

                  <td className="px-1 py-3">
  <div className="flex justify-center">
    <button
      onClick={() => handleDelete(user.id)}
      className="
        h-9 
        px-4 
        bg-red-600 
        text-white 
        rounded-lg 
        hover:bg-red-500
        flex 
        items-center 
        gap-1.5 
        text-sm 
        font-medium
        cursor-pointer
      "
    >
      <Trash size={14} />
      Delete
    </button>
  </div>
</td>

                </tr>
              );
            })}

            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500 italic">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
