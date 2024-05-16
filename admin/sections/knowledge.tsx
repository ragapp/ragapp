import {
  File,
  FileStatus,
  fetchFiles,
  removeFile,
  uploadFile,
} from "@/client/files";
import { ExpandableSection } from "@/components/ui/custom/expandableSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export const Knowledge = () => {
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const updateStatus = (name: string, status: FileStatus) => (f: File) => {
    if (f.name === name) {
      return { ...f, status };
    }
    return f;
  };

  async function handleRemoveFile(file: File) {
    setFiles((prevFiles) => {
      return prevFiles.map(updateStatus(file.name, "removing"));
    });
    try {
      await removeFile(file.name);
      // Remove the file from the list
      setFiles((prevFiles) => {
        const filteredFiles = prevFiles.filter((f) => f.name !== file.name);
        return filteredFiles;
      });
    } catch {
      // Update the file status to failed
      setFiles((prevFiles) => {
        return prevFiles.map(updateStatus(file.name, "failed"));
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
      try {
        await uploadFile(formData);
        setFiles((prevFiles) => {
          return prevFiles.map(updateStatus(fileObj.name, "uploaded"));
        });
      } catch (err: unknown) {
        setFiles((prevFiles) => {
          return prevFiles.map(updateStatus(fileObj.name, "failed"));
        });
        // Show a error toast
        console.error(
          "Failed to upload the file:",
          file.name,
          (err as Error)?.message,
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
      try {
        const files = await fetchFiles();
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
