"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import CareerForm from "../../components/CareerForm";
import Button from "@/app/components/Button";

export default function EditCareerPage() {
  const { id } = useParams();
    const router = useRouter();
  const [career, setCareer] = useState<any>(null);

  useEffect(() => {
    const fetchCareer = async () => {
      const ref = doc(db, "careers", id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setCareer({ id: snap.id, ...snap.data() });
      }
    };
    fetchCareer();
  }, [id]);

  return (
    <div className="p-6">

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold">Edit Career</h3>
        <Button
  onClick={() => router.back()}
 className="text-black"
  text="Back"
/>

      </div>

      {career ? (
        <CareerForm existingCareer={career} />
      ) : (
        <p>Loading career...</p>
      )}
    </div>
  );
}
