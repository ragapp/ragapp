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
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
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

  async function handleRemoveFile(file: File) {
    updateStatus(file, "removing");
    try {
      await removeFile(file.name);
      remove(getFileIndex(file));
    } catch {
      updateStatus(file, "failed");
      toast({
        className: cn(
          "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 text-red-500",
        ),
        title: "Failed to remove the file: " + file.name + "!",
      });
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
        reset({ files });
      } catch (error) {
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
      name="knowledge"
      title={"Knowledge"}
      description="Upload your own data to chat with"
    >
      <form onSubmit={handleSubmit(handleAddFiles)}>
        <ListFiles files={fields} handleRemoveFile={handleRemoveFile} />
        <UploadFile append={append} />
        {fields.length > 0 && (
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

const UploadFile = ({ append }: { append: (file: File) => void }) => {
  return (
    <div className="grid mt-10 w-full max-w-sm items-center gap-1.5">
      <Label>Upload File</Label>
      <Input
        type="file"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          files.forEach((file) => {
            append({
              name: file.name,
              status: "selecting" as FileStatus,
              blob: file,
            });
          });
          e.target.value = ""; // Clear the input value
        }}
      />
    </div>
  );
};
