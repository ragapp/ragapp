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
import { toast } from "@/components/ui/use-toast";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { FileLoaderConfig } from "./fileLoader";

export const Knowledge = () => {
  const { control, reset } = useForm({
    defaultValues: {
      files: [] as File[],
    },
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "files",
  });

  const getFileIndex = (file: File) =>
    fields.findIndex((f) => f.name === file.name);

  const updateStatus = (file: File, new_status: FileStatus) => {
    update(getFileIndex(file), { ...file, status: new_status });
  };

  async function handleRemoveFile(file: File) {
    setSubmitting(true);
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
    setSubmitting(false);
  }

  async function handleAddFiles() {
    // Upload the selecting files
    const selectingFiles = fields.filter((file) => file.status === "selecting");
    if (selectingFiles.length > 0) {
      setSubmitting(true);
      for (const file of selectingFiles) {
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
      setSubmitting(false);
    }
  }

  useEffect(() => {
    handleAddFiles();
  }, [fields]);

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
  }, []);

  return (
    <ExpandableSection
      name="knowledge"
      title={"Knowledge"}
      description="Upload your own data to chat with"
    >
      <ListFiles
        files={fields}
        handleRemoveFile={handleRemoveFile}
        isSubmitting={submitting}
      />
      <form>
        <UploadFile
          append={append}
          uploadedFiles={fields}
          isSubmitting={submitting}
        />
      </form>
      <div className="border-b mb-2 border-gray-300 pt-4 pb-4"></div>
      <FileLoaderConfig />
    </ExpandableSection>
  );
};

const ListFiles = ({
  files,
  handleRemoveFile,
  isSubmitting,
}: {
  files: File[];
  handleRemoveFile: (file: File) => void;
  isSubmitting: boolean;
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
                        ) : isSubmitting ? (
                          ""
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
  isSubmitting,
}: {
  append: (file: File) => void;
  uploadedFiles: File[];
  isSubmitting: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const checkFileExist = (file: globalThis.File) => {
    if (uploadedFiles.some((f) => f.name === file.name)) {
      toast({
        title: "The file " + file.name + " is existing!",
        variant: "destructive",
      });
      return true;
    }
    return false;
  };

  return (
    <div className="grid mt-10 w-full max-w-sm items-center gap-1.5">
      <Input
        ref={inputRef}
        id="knowledge-file-upload"
        type="file"
        style={{ display: "none" }}
        multiple
        onChange={async (e) => {
          const selectedFiles = Array.from(e.target.files ?? []);
          await Promise.all(
            selectedFiles.map(async (file) => {
              // Check if the file is already uploaded
              if (checkFileExist(file)) {
                return;
              }
              append({
                name: file.name,
                blob: file,
                status: "selecting",
              });
            }),
          );
          e.target.value = "";
        }}
      />
      <Label htmlFor="knowledge-file-upload">
        <Button
          type="button"
          className="rounded"
          disabled={isSubmitting}
          onClick={(e) => {
            e.preventDefault();
            inputRef.current?.click();
          }}
        >
          Upload new files
        </Button>
      </Label>
    </div>
  );
};
