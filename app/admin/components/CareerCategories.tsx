"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  FolderPlus,
} from "lucide-react";

type CareerCategory = {
  id: string;
  name: string;
  slug: string;
  position: number;
  createdAt?: any;
};

export default function CareerCategories() {
  const [categories, setCategories] = useState<CareerCategory[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH CATEGORIES
  // =========================
  const fetchCategories = async () => {
    try {
      setLoading(true);

      const q = query(
        collection(db, "careerCategories"),
        orderBy("position", "asc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CareerCategory[];

      setCategories(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // =========================
  // CREATE SLUG
  // =========================
  const createSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  // =========================
  // ADD CATEGORY
  // =========================
  const handleAddCategory = async () => {
    try {
      if (!newCategory.trim()) {
        toast.error("Category name required");
        return;
      }

      const exists = categories.some(
        (cat) =>
          cat.name.toLowerCase() ===
          newCategory.trim().toLowerCase()
      );

      if (exists) {
        toast.error("Category already exists");
        return;
      }

      const slug = createSlug(newCategory);

      await addDoc(collection(db, "careerCategories"), {
        name: newCategory.trim(),
        slug,
        position: categories.length + 1,
        createdAt: serverTimestamp(),
      });

      toast.success("Category added");

      setNewCategory("");

      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add category");
    }
  };

  // =========================
  // DELETE CATEGORY
  // =========================
  const handleDelete = async (
    id: string,
    name: string
  ) => {
    const confirmDelete = window.confirm(
      `Delete "${name}" category?`
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "careerCategories", id));

      toast.success("Category deleted");

      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category");
    }
  };

  // =========================
  // MOVE UP
  // =========================
  const moveUp = async (index: number) => {
    if (index === 0) return;

    try {
      const current = categories[index];
      const prev = categories[index - 1];

      await updateDoc(
        doc(db, "careerCategories", current.id),
        {
          position: prev.position,
        }
      );

      await updateDoc(
        doc(db, "careerCategories", prev.id),
        {
          position: current.position,
        }
      );

      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to reorder");
    }
  };

  // =========================
  // MOVE DOWN
  // =========================
  const moveDown = async (index: number) => {
    if (index === categories.length - 1) return;

    try {
      const current = categories[index];
      const next = categories[index + 1];

      await updateDoc(
        doc(db, "careerCategories", current.id),
        {
          position: next.position,
        }
      );

      await updateDoc(
        doc(db, "careerCategories", next.id),
        {
          position: current.position,
        }
      );

      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to reorder");
    }
  };

  return (
    <div className="p-6 md:p-8">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">
          Career Categories
        </h1>

        <p className="text-gray-500 mt-1">
          Create, delete and reorder categories
        </p>
      </div>

      {/* ADD CATEGORY */}
      <div className="bg-white border rounded-2xl p-5 mb-8">

        <div className="flex flex-col md:flex-row gap-3">

          <input
            type="text"
            placeholder="Enter category name"
            value={newCategory}
            onChange={(e) =>
              setNewCategory(e.target.value)
            }
            className="
              border
              rounded-xl
              px-4
              py-3
              w-full
              outline-none
              focus:ring-2
              focus:ring-black
            "
          />

          <button
            onClick={handleAddCategory}
            className="
              bg-black
              text-white
              px-6
              py-3
              rounded-xl
              flex
              items-center
              justify-center
              gap-2
              hover:opacity-90
              transition
            "
          >
            <FolderPlus size={18} />
            Add Category
          </button>

        </div>
      </div>

      {/* CATEGORY LIST */}
      <div className="space-y-4">

        {loading ? (
          <div className="text-gray-500">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="border rounded-2xl p-10 text-center text-gray-500">
            No categories found
          </div>
        ) : (
          categories.map((cat, index) => (
            <div
              key={cat.id}
              className="
                border
                rounded-2xl
                p-5
                bg-white
                flex
                items-center
                justify-between
                gap-4
              "
            >

              {/* LEFT */}
              <div>

                <h3 className="font-semibold text-lg text-black capitalize">
                  {cat.name}
                </h3>

                <p className="text-sm text-gray-500">
                  Slug: {cat.slug}
                </p>

              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-2">

                {/* MOVE UP */}
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="
                    w-10
                    h-10
                    rounded-xl
                    border
                    flex
                    items-center
                    justify-center
                    hover:bg-gray-100
                    disabled:opacity-40
                  "
                >
                  <ChevronUp size={18} />
                </button>

                {/* MOVE DOWN */}
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === categories.length - 1}
                  className="
                    w-10
                    h-10
                    rounded-xl
                    border
                    flex
                    items-center
                    justify-center
                    hover:bg-gray-100
                    disabled:opacity-40
                  "
                >
                  <ChevronDown size={18} />
                </button>

                {/* DELETE */}
                <button
                  onClick={() =>
                    handleDelete(cat.id, cat.name)
                  }
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-red-500
                    text-white
                    flex
                    items-center
                    justify-center
                    hover:bg-red-600
                  "
                >
                  <Trash2 size={18} />
                </button>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}