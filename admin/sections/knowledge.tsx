import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { ExpandableSection } from "@/components/ui/custom/expandableSection";

type FileStatus = "uploading" | "uploaded" | "failed" | "removing" | "removed";

type File = {
  name: string;
  status: FileStatus;
};

async function fetchFiles() {
  const res = await fetch("/api/management/files");
  console.log(res);
  return res.json();
}

async function uploadFile(formData: any) {
  return await fetch("/api/management/files", {
    method: "POST",
    body: formData,
  });
}

async function removeFile(fileName: string) {
  const encodedFileName = encodeURIComponent(fileName);
  return await fetch(`/api/management/files/${encodedFileName}`, {
    method: "DELETE",
  });
}

const Knowledge = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleRemoveFile(file: File) {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.map((f) => {
        if (f.name === file.name) {
          return { ...f, status: "removing" as FileStatus };
        }
        return f;
      });
      return updatedFiles;
    });
    const res = await removeFile(file.name);
    if (res.ok) {
      // Remove the file from the list
      setFiles((prevFiles) => {
        const filteredFiles = prevFiles.filter((f) => f.name !== file.name);
        return filteredFiles;
      });
    } else {
      // Update the file status to failed
      setFiles((prevFiles) => {
        const updatedFiles = prevFiles.map((f) => {
          if (f.name === file.name) {
            return { ...f, status: "failed" as FileStatus };
          }
          return f;
        });
        return updatedFiles;
      });
    }
  }

  async function handleAddFiles(addingFiles: any[]) {
    for (const file of addingFiles) {
      // Add the file to list files with uploading status
      const fileObj = {
        name: file.name,
        status: "uploading" as FileStatus,
      };
      setFiles((prevFiles) => [...prevFiles, fileObj]);
      // Upload the file to the server
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadFile(formData);
      if (res.ok) {
        setFiles((prevFiles) => {
          const updatedFiles = prevFiles.map((f) => {
            if (f.name === fileObj.name) {
              return { ...f, status: "uploaded" as FileStatus };
            }
            return f;
          });
          return updatedFiles;
        });
      } else {
        setFiles((prevFiles) => {
          const updatedFiles = prevFiles.map((f) => {
            if (f.name === fileObj.name) {
              return { ...f, status: "uploaded" as FileStatus };
            }
            return f;
          });
          return updatedFiles;
        });
        // Show a error toast
        console.error(
          "Failed to upload the file:",
          file.name,
          await res.text(),
        );
        toast({
          className: cn(
            "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 text-red-500",
          ),
          title: "Failed to upload the file: " + file.name + "!",
        });
      }
    }
  }

  useEffect(() => {
    async function handleFetchFiles() {
      setLoading(true);
      try {
        const files = (await fetchFiles()) as File[];
        setFiles(files);
      } catch (error) {
        console.error(error);
        // Show a error toast
        toast({
          className: cn(
            "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 text-red-500",
          ),
          title: "Failed to load uploaded files!",
        });
      }
      setLoading(false);
    }

    handleFetchFiles();
  }, [toast]);

  return (
    <ExpandableSection
      title={"Knowledge"}
      description="Upload your own data to chat with"
      open
    >
      <ListFiles files={files} handleRemoveFile={handleRemoveFile} />
      <UploadFile handleAddFiles={handleAddFiles} />
    </ExpandableSection>
  );
};

const ListFiles = ({
  files,
  handleRemoveFile,
}: {
  files: File[];
  handleRemoveFile: (file: File) => void;
}) => {
  return (
    // Show uploaded files in grid layout
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map(
        (file, index) =>
          file.status !== "failed" && (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    key={index}
                    className={`rounded-lg p-2 border border-gray-300 ${file.status === "removing" ? "bg-gray-100" : "bg-white"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        {file.name.length > 20
                          ? `${file.name.slice(0, 10)}...${file.name.slice(-10)}`
                          : file.name}
                      </div>
                      <button
                        className="text-gray-500 text-sm"
                        onClick={() => handleRemoveFile(file)}
                      >
                        {file.status.includes("removing") ||
                        file.status.includes("uploading")
                          ? file.status
                          : "✖"}
                      </button>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{file.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ),
      )}
    </div>
  );
};

const UploadFile = ({ handleAddFiles = async (files: any[]) => {} }) => {
  return (
    <div className="grid mt-10 w-full max-w-sm items-center gap-1.5">
      <Label>Upload File</Label>
      <Input
        type="file"
        multiple
        onChange={async (e) => {
          await handleAddFiles(Array.from(e.target.files ?? []));
          e.target.value = ""; // Clear the input value
        }}
      />
    </div>
  );
};

export { Knowledge };
