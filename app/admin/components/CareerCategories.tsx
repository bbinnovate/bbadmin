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
  Pencil,
  Check,
  X,
} from "lucide-react";
import Button from "@/app/components/Button";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { GripVertical } from "lucide-react";

type CareerCategory = {
  id: string;
  name: string;
  slug: string;
  position: number;
  createdAt?: any;
};


function SortableItem({
  cat,
  children,
}: {
  cat: CareerCategory;
  children: React.ReactNode;
}) {
  const {
  attributes,
  listeners,
  setNodeRef,
  transform,
  transition,
} = useSortable({
  id: cat.id,
});

  const style = {
    transform: CSS.Transform.toString(
      transform
    ),
    transition,
  };

  return (
<div
  ref={setNodeRef}
  style={style}
  {...attributes}
  {...listeners}
  className="relative cursor-grab active:cursor-grabbing"
>
      <div
     
        className="
          absolute
          left-3
          top-1/2
          -translate-y-1/2
          cursor-grab
          text-gray-400
          hover:text-black
          z-10
        "
      >
        <GripVertical size={20} />
      </div>

      {children}
    </div>
  );
}

export default function CareerCategories() {
  const [categories, setCategories] = useState<CareerCategory[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editValue, setEditValue] = useState("");
  const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10,
    },
  })
);

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
// UPDATE CATEGORY
// =========================
const handleUpdateCategory = async (id: string) => {
  try {
    if (!editValue.trim()) {
      toast.error("Category name required");
      return;
    }

    const exists = categories.some(
      (cat) =>
        cat.id !== id &&
        cat.name.toLowerCase() ===
          editValue.trim().toLowerCase()
    );

    if (exists) {
      toast.error("Category already exists");
      return;
    }

    const category = categories.find(
  (c) => c.id === id
);

if (!category) return;

const oldSlug = category.slug;
const newSlug = createSlug(editValue);

await updateDoc(
  doc(db, "careerCategories", id),
  {
    name: editValue.trim(),
    slug: newSlug,
  }
);


const careersSnapshot = await getDocs(
  collection(db, "careers")
);

const matchingCareers =
  careersSnapshot.docs.filter(
    (career) =>
      career.data().category === oldSlug
  );

await Promise.all(
  matchingCareers.map((career) =>
    updateDoc(
      doc(db, "careers", career.id),
      {
        category: newSlug,
      }
    )
  )
);

    toast.success("Category updated");

    setEditingId("");
    setEditValue("");

    fetchCategories();
  } catch (error) {
    console.error(error);
    toast.error("Failed to update category");
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



  const handleDragEnd = async (event: any) => {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  const oldIndex = categories.findIndex(
    (item) => item.id === active.id
  );

  const newIndex = categories.findIndex(
    (item) => item.id === over.id
  );

  const reordered = arrayMove(
    categories,
    oldIndex,
    newIndex
  );

  setCategories(reordered);

  try {
    await Promise.all(
      reordered.map((item, index) =>
        updateDoc(
          doc(db, "careerCategories", item.id),
          {
            position: index + 1,
          }
        )
      )
    );

    toast.success("Category order updated");
  } catch (error) {
    console.error(error);
    toast.error("Failed to reorder");
    fetchCategories();
  }
};

  return (
    <div className=" relative">

      {/* HEADER */}

        <h3 className=" font-semibold mb-5"> Career Categories</h3>
       
     

      {/* ADD CATEGORY */}
      <div className="bg-white border rounded-lg p-5 mb-8">

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
              rounded-lg
              px-4
              py-3
              w-full
              outline-none
              focus:ring-2
              focus:ring-black
            "
          />


           <Button
           onClick={handleAddCategory}
          text="Add Category"
          className="text-black font-semibold"
        />
        </div>
      </div>

      {/* CATEGORY LIST */}
      <div className="space-y-4">

        {loading ? (
          <div className="text-gray-500">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="border rounded-lg p-10 text-center text-gray-500">
            No categories found
          </div>
        ) : (
          
          <DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={categories.map(
      (item) => item.id
    )}
    strategy={verticalListSortingStrategy}
  >
    {categories.map((cat, index) => (
      <SortableItem
        key={cat.id}
        cat={cat}
      >
            <div
              key={cat.id}
              className="
                border
                rounded-lg
                p-5
                bg-white
                flex
                items-center
                justify-between
                gap-4
              "
            >

              {/* LEFT */}
              <div className="flex-1">
  {editingId === cat.id ? (
    <div className="space-y-2">
      <input
       onPointerDown={(e) => e.stopPropagation()}
        value={editValue}
        onChange={(e) =>
          setEditValue(e.target.value)
        }
        className="
          w-full
          border
          rounded-lg
          px-3
          py-2
          outline-none
          focus:ring-2
          focus:ring-black
        "
      />

      <p className="text-sm text-gray-500">
        Slug: {createSlug(editValue)}
      </p>
    </div>
  ) : (
    <>
      <h3 className="font-semibold text-black capitalize">
        {cat.name}
      </h3>

      <p className="text-sm text-gray-500">
        Slug: {cat.slug}
      </p>
    </>
  )}
</div>

              {/* RIGHT */}
              <div className="flex items-center gap-2">

                {editingId === cat.id ? (
  <>
    <button
      onClick={() =>
        handleUpdateCategory(cat.id)
      }
      className="
        w-10
        h-10
        rounded-lg
        bg-green-500
        text-white
        flex
        items-center
        justify-center
      "
    >
      <Check size={18} />
    </button>

    <button
      onClick={() => {
        setEditingId("");
        setEditValue("");
      }}
      className="
        w-10
        h-10
        rounded-lg
        bg-gray-500
        text-white
        flex
        items-center
        justify-center
      "
    >
      <X size={18} />
    </button>
  </>
) : (
  <button
   onPointerDown={(e) => e.stopPropagation()}
    onClick={() => {
      setEditingId(cat.id);
      setEditValue(cat.name);
    }}
    className="
      w-10
      h-10
      rounded-lg
      border
      flex
      items-center
      justify-center
      hover:bg-gray-100
    "
  >
    <Pencil size={18} />
  </button>
)}

                {/* MOVE UP */}
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="
                    w-10
                    h-10
                    rounded-lg
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
                    rounded-lg
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
                    rounded-lg
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
               </SortableItem>
    ))}
  </SortableContext>
</DndContext>
        )}
      </div>
    </div>
  );
}