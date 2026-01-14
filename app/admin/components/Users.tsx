"use client";

import React, { useEffect, useState ,useRef} from "react";
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
import { useAdminGuard } from '../hooks/useAdminGuard';

type UserType = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  createdAt?: string | { seconds: number; nanoseconds: number };
};

export const ALL_PERMISSIONS = [
  { key: "blogs", label: "Blogs" },
  { key: "career", label: "Career" },
  { key: "contact", label: "Contact Applications" },
  { key: "clients", label: "Client Applications" },
  { key: "calculator", label: "Calculator" },
  { key: "users", label: "Users" },
];

const Users = () => {

  
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement | null>(null);


  // 🔥 dropdown open state
  const [openPermissionUser, setOpenPermissionUser] = useState<string | null>(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as UserType[];
        setUsers(list);
      } catch (e) {
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);


// ClickOutside
  useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setOpenPermissionUser(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


  // Role change
  const handleRoleChange = async (id: string, role: string) => {
    const update =
      role === "admin"
        ? { role: "admin", permissions: ["all"] }
        : { role: "user", permissions: [] };

    await updateDoc(doc(db, "users", id), update);

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...update } : u))
    );
  };

  // Delete user
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await deleteDoc(doc(db, "users", id));
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success("User deleted");
  };

  // ✅ normalize permissions safely
  const normalizePermissions = (p: any): string[] => {
    if (Array.isArray(p)) return p;
    if (p === "all") return ["all"];
    return [];
  };



//   const visiblePermissions = (() => {
//   const perms = normalizePermissions(users.permissions);
//   return perms.length > 1 ? perms.filter(p => p !== "all") : perms;
// })();


  if (loading) return <p className="text-center py-10">Loading users...</p>;

  return (
    <div className="">
      <h3 className="text-2xl font-semibold mb-6">User Management</h3>

      <div className=" border rounded-lg shadow">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-6 py-3 text-left">SR No.</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Date Joined</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-center">Select</th>
              <th className="px-6 py-3 text-left">Permissions</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 border-t">
            {users.map((user, idx) => {
              let joinedDate = "—";
              if (user.createdAt) {
                if (typeof user.createdAt === "string") {
                  joinedDate = new Date(user.createdAt).toLocaleDateString("en-GB");
                } else if ("seconds" in user.createdAt) {
                  joinedDate = new Date(user.createdAt.seconds * 1000).toLocaleDateString("en-GB");
                }
              }

              return (
                <tr key={user.id} className="border-b border-black">
                  <td className="px-6 py-3">{idx + 1}</td>
                  <td className="px-6 py-3 capitalize">{user.name || "—"}</td>
                  <td className="px-6 py-3">{user.email}</td>
                  <td className="px-6 py-3">{joinedDate}</td>

                  {/* ROLE */}
                  <td className="px-6 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="border rounded px-3 py-1 text-sm cursor-pointer"
                    >
                      <option className="cursor-pointer" value="user">User</option>
                      <option className="cursor-pointer" value="admin">Admin</option>
                    </select>
                  </td>

                  {/* ✅ PERMISSIONS DROPDOWN */}
                  <td className="px-3 py-2  relative">
                    <div ref={dropdownRef} className="">
                    {user.role === "admin" && (
                      <div className="space-y-2">


                        
                        
                        <button
                          onClick={() =>
                            setOpenPermissionUser(
                              openPermissionUser === user.id ? null : user.id
                            )
                          }
                          className="w-full border rounded px-1 py-1 text-sm cursor-pointer bg-white flex justify-center items-center gap-2"
                        >
                          Select Permissions
                           <svg
    className={`w-4 h-4 transition-transform duration-200 cursor-pointer ${
      openPermissionUser === user.id ? "rotate-180" : ""
    }`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
                        </button>

                        {openPermissionUser === user.id && (
                          <div className="absolute z-99 overflow-visible mt-1 w-full  bg-white border rounded-md shadow-lg p-3 space-y-2">
                            {ALL_PERMISSIONS.map((p) => {
                              const selected = normalizePermissions(user.permissions).includes(p.key);
                              return (
                                <label key={p.key} className="flex gap-2 text-sm cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={async () => {
                                      let updated = normalizePermissions(user.permissions);
                                      updated = selected
                                        ? updated.filter((x) => x !== p.key)
                                        : [...updated, p.key];

                                      await updateDoc(doc(db, "users", user.id), {
                                        permissions: updated,
                                      });

                                      setUsers((prev) =>
                                        prev.map((u) =>
                                          u.id === user.id ? { ...u, permissions: updated } : u
                                        )
                                      );

                                      toast.success("Permissions updated");
                                    }}
                                  />
                                  {p.label}
                                </label>
                              );
                            })}
                          </div>
                        )}

                        
                      </div>
                    )}
                    </div>
                  </td>


                  <td className="px-3 py-3">
  <div className="flex flex-wrap gap-2 max-w-[220px]">
    {(() => {
      const perms = normalizePermissions(user.permissions);
      const visiblePermissions =
        perms.length > 1 ? perms.filter(p => p !== "all") : perms;

      return visiblePermissions.map((perm) => (
        <span
          key={perm}
          className="w-[85%] text-center px-2 py-0.5 capitalize bg-green-100 text-green-800 rounded text-xs font-semibold"
        >
          {perm}
        </span>
      ));
    })()}
  </div>
</td>



                  {/* ACTION */}
                  <td className="px-1 py-3">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
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
                <td colSpan={7} className="text-center py-6 text-gray-500 italic">
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
