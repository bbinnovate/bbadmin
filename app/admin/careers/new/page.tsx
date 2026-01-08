"use client";

import Button from "@/app/components/Button";
import CareerForm from "../../components/CareerForm";
import { useRouter } from "next/navigation";

export default function NewCareerPage() {
    const router = useRouter();
  return (
    <div className="p-6">
        <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold">Add New Career</h3>
        <Button
  onClick={() => router.back()}
 className="text-black"
  text="Back"
/>

      </div>

      <CareerForm />
    </div>
  );
}
