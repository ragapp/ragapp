import {
  File,
  FileStatus,
  fetchFiles,
  removeFile,
  uploadFile,
} from "@/client/files";
import { Button } from "@/components/ui/button";
import { ExpandableSection } from "@/components/ui/custom/expandableSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast, useToast } from "@/components/ui/use-toast";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { FileLoaderConfig } from "./fileLoader";

export const Knowledge = () => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      files: [] as File[],
    },
  });
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "files",
  });
  const { toast } = useToast();

  const getFileIndex = (file: File) =>
    fields.findIndex((f) => f.name === file.name);

  const updateStatus = (file: File, new_status: FileStatus) => {
    update(getFileIndex(file), { ...file, status: new_status });
  };

  const selectingFiles = fields.some((file) => file.status === "selecting");

  async function handleRemoveFile(file: File) {
    if (file.status === "uploaded") {
      updateStatus(file, "removing");
      try {
        await removeFile(file.name);
        remove(getFileIndex(file));
      } catch {
        updateStatus(file, "failed");
        toast({
          title: "Failed to remove the file: " + file.name + "!",
          variant: "destructive",
        });
      }
    } else {
      remove(getFileIndex(file));
    }
  }

  async function handleAddFiles(data: { files: File[] }) {
    // Upload the selecting files
    for (const file of data.files) {
      try {
        if (file.blob && file.status === "selecting") {
          // Change the status of the file to uploading
          updateStatus(file, "uploading");
          const formData = new FormData();
          formData.append("file", file.blob);
          await uploadFile(formData);
          // Change the status of the file to uploaded
          updateStatus(file, "uploaded");
        }
      } catch (err: unknown) {
        remove(getFileIndex(file));
        toast({
          title: "Failed to upload the file: " + file.name + "!",
          variant: "destructive",
        });
      }
    }
  }

  useEffect(() => {
    async function handleFetchFiles() {
      try {
        const files = await fetchFiles();
        reset({ files });
      } catch (error) {
        toast({
          title: "Failed to load uploaded files!",
          variant: "destructive",
        });
      }
    }

    handleFetchFiles();
  }, [toast]);

  return (
    <ExpandableSection
      name="knowledge"
      title={"Knowledge"}
      description="Upload your own data to chat with"
    >
      <form onSubmit={handleSubmit(handleAddFiles)}>
        <ListFiles files={fields} handleRemoveFile={handleRemoveFile} />
        <UploadFile append={append} uploadedFiles={fields} />
        {selectingFiles && (
          <Button type="submit" className="mt-4 p-2 text-white rounded">
            Upload
          </Button>
        )}
      </form>
      <div className="border-b mb-2 border-gray-300 pt-4 pb-4"></div>
      <FileLoaderConfig />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map(
        (file, index) =>
          file.status !== "failed" && (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    key={index}
                    className={`rounded-lg p-2 border border-gray-300 ${file.status === "removing" || file.status === "selecting" ? "bg-gray-100" : "bg-white"}`}
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
                        {file.status === "uploading" ? (
                          <LoaderCircle className="animate-spin" />
                        ) : (
                          "✖"
                        )}
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

const UploadFile = ({
  append,
  uploadedFiles,
}: {
  append: (file: File) => void;
  uploadedFiles: File[];
}) => {
  return (
    <div className="grid mt-10 w-full max-w-sm items-center gap-1.5">
      <Label>Upload File</Label>
      <Input
        type="file"
        multiple
        onChange={(e) => {
          const selectedFiles = Array.from(e.target.files ?? []);
          for (const file of selectedFiles) {
            // Check if the file is already uploaded
            if (uploadedFiles.some((f) => f.name === file.name)) {
              toast({
                title: "The file " + file.name + " is existing!",
                variant: "destructive",
              });
              continue;
            }
            // Append the file to the list of files
            append({
              name: file.name,
              blob: file,
              status: "selecting",
            });
          }
          e.target.value = ""; // Clear the input value
        }}
      />
    </div>
  );
};
