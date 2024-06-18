import { getBaseURL } from "./utils";

export type FileStatus =
  | "uploading"
  | "uploaded"
  | "failed"
  | "removing"
  | "removed";

  export type File = {
    name: string;
    status: FileStatus;
  };
  
  // Define FileObject type
  export interface FileObject {
    name: string;
    status: FileStatus;
  }
  
  // Define FilesState type
  export interface FilesState {
    [collection: string]: FileObject[];
  }

export async function fetchFiles(collectionName: string): Promise<FileObject[]> {
  const res = await fetch(`${getBaseURL()}/api/management/files?collection=${encodeURIComponent(collectionName)}`);
  if (!res.ok) {
    throw new Error("Failed to fetch files");
  }
  const files: FileObject[] = await res.json();
  return files;
}

export async function uploadFile(collection: string, formData: FormData) {
  const res = await fetch(`${getBaseURL()}/api/management/files/${encodeURIComponent(collection)}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
}

export async function removeFile(collection: string, fileName: string) {
  const encodedFileName = encodeURIComponent(fileName);
  const res = await fetch(
    `${getBaseURL()}/api/management/files/${encodeURIComponent(collection)}/${encodedFileName}`,
    {
      method: "DELETE",
    },
  );
  if (!res.ok) {
    throw new Error("Failed to remove file");
  }
}