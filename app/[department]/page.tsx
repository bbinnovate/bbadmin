import type { Metadata } from "next";
import Preview from "./Preview";
import { adminDB } from "@/lib/firebase-admin";

type GenerateMetadataParams = {
  params: Promise<{ department?: string }>;
};

export async function generateMetadata({
  params,
}: GenerateMetadataParams): Promise<Metadata> {
  // ✅ REQUIRED IN NEXT 15
  const { department } = await params;

  // 🛑 HARD SAFETY GUARD
  if (!department || typeof department !== "string") {
    return {
      title: "Get a Free Digital Marketing Cost Calculator | Bombay Blokes",
      description:
        "Plan your digital marketing budget with our easy-to-use cost calculator.",
    };
  }

  try {
    const snap = await adminDB
      .collection("calculatorDepartments")
      .doc(department)
      .get();

    if (!snap.exists) {
      return {
        title: "Get a Free Digital Marketing Cost Calculator | Bombay Blokes",
        description:
          "Plan your digital marketing budget with our easy-to-use cost calculator.",
      };
    }

    const data = snap.data() ?? {};

    return {
      title:
        data.metaTitle ||
        "Get a Free Digital Marketing Cost Calculator | Bombay Blokes",

      description:
        data.metaDescription ||
        "Plan your digital marketing budget with our easy-to-use cost calculator.",

      openGraph: {
        title:
          data.metaTitle ||
          "Get a Free Digital Marketing Cost Calculator | Bombay Blokes",
        description:
          data.metaDescription ||
          "Plan your digital marketing budget with our easy-to-use cost calculator.",
        type: "website",
      },
    };
  } catch (error) {
    console.error("generateMetadata error:", error);

    return {
      title: "Get a Free Digital Marketing Cost Calculator | Bombay Blokes",
      description:
        "Plan your digital marketing budget with our easy-to-use cost calculator.",
    };
  }
}

export default function DepartmentPage() {
  return <Preview />;
}
