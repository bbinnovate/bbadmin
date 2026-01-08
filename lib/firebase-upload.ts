import { storage } from "./firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  UploadResult,
} from "firebase/storage";

export interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  fullPath: string;
}

export async function uploadFileToFirebase(
  file: Buffer | Uint8Array,
  filename: string,
  folder: string = "cvs"
): Promise<UploadedFile> {
  try {
    // Create a unique filename with timestamp to avoid collisions
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${timestamp}_${sanitizedFilename}`;

    // Create a reference to the file location
    const storageRef = ref(storage, `${folder}/${uniqueFilename}`);

    // Upload the file
    const uploadResult: UploadResult = await uploadBytes(storageRef, file, {
      contentType: getMimeType(filename),
    });

    // Get the download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);

    return {
      url: downloadURL,
      filename: sanitizedFilename,
      size: uploadResult.metadata.size || 0,
      fullPath: uploadResult.metadata.fullPath,
    };
  } catch (error) {
    console.error("Error uploading file to Firebase:", error);
    throw new Error("Failed to upload file to Firebase Storage");
  }
}

export function base64ToBuffer(base64String: string): Buffer {
  // Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
  const base64Data = base64String.includes(",")
    ? base64String.split(",")[1]
    : base64String;

  return Buffer.from(base64Data, "base64");
}

function getMimeType(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();

  const mimeTypes: { [key: string]: string } = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
  };

  return mimeTypes[extension || ""] || "application/octet-stream";
}
