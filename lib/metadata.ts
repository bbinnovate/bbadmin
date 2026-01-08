import type { Metadata } from "next";

export function createPageMetadata(pageName: string): Metadata {
  const capitalized =
    pageName.charAt(0).toUpperCase() + pageName.slice(1).toLowerCase();
  return {
    title: `Bombay Blokes | ${capitalized}`,
    description:
      "Integrated Digital Solutions in Mumbai | Marketing Agency in Mumbai - Bombay Blokes",
  };
}
