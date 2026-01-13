"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Edit, Trash, ExternalLink } from "lucide-react";

type Calculator = {
  id: string;
  name: string;
  createdAt?: any;
};

const AllCalculator = () => {
  const router = useRouter();
  const [calculators, setCalculators] = useState<Calculator[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH CALCULATORS ================= */

  const fetchCalculators = async () => {
    try {
      const snap = await getDocs(collection(db, "calculatorDepartments"));

      const list: Calculator[] = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        name: docSnap.data().name || docSnap.id,
        createdAt: docSnap.data().createdAt || docSnap.data().updatedAt,
      }));

      setCalculators(list);
    } catch (err) {
      console.error("Failed to fetch calculators:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalculators();
  }, []);

  /* ================= DELETE ================= */

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this calculator?"
    );
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "calculatorDepartments", id));
      setCalculators((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete calculator");
    }
  };

  /* ================= UI ================= */

  return (
       <div className=" relative">
      <h3 className=" font-semibold mb-5">All Calculators</h3>

      {loading ? (
        <p>Loading...</p>
      ) : calculators.length === 0 ? (
        <p>No calculators found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left table-auto">
                <thead className="bg-gray-100 text-[#1D1D1B] text-sm font-semibold">
                  <tr>
                    <th className="py-3 px-4">SR No.</th>
                    <th className="py-3 px-4">Calculators Name</th>
                    <th className="py-3 px-4">Preview Link</th>
                    <th className="py-3 px-4">Date Created</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>

           <tbody>
  {calculators.map((calc, idx) => (
    <tr key={calc.id} className="border-t">
      {/* SR NO */}
      <td className="px-4 py-3 align-middle">
        {idx + 1}
      </td>

      {/* NAME */}
      <td className="px-4 py-3 align-middle capitalize font-medium">
        {calc.name}
      </td>

      {/* LINK */}
      <td className="px-4 py-3 align-middle">
        <a
          href={`/${calc.id}`}
          target="_blank"
          className="text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          View <ExternalLink size={14} />
        </a>
      </td>

      {/* DATE */}
      <td className="px-4 py-3 align-middle">
        {calc.createdAt?.seconds
          ? new Date(calc.createdAt.seconds * 1000).toLocaleDateString("en-GB")
          : "—"}
      </td>

      {/* ACTION */}
      <td className="px-4 py-3 align-middle ">
  <div className="flex items-center justify-center gap-2">
    <button
      onClick={() =>
        router.push(`/admin/calculatorform?id=${calc.id}`)
      }
      className="h-9 px-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 
                 flex items-center gap-1 text-sm cursor-pointer"
    >
      <Edit size={14} />
      Edit
    </button>

    <button
      onClick={() => handleDelete(calc.id)}
      className="h-9 px-3 bg-red-600 text-white rounded-md hover:bg-red-500 
                 flex items-center gap-1 text-sm cursor-pointer"
    >
      <Trash size={14} />
      Delete
    </button>
  </div>
</td>

    </tr>
  ))}
</tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default AllCalculator;
