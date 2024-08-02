import { File, fetchFiles, removeFile, uploadFile } from "@/client/files";
import {
  FileLoaderSchema,
  fetchFileLoader,
  updateFileLoader,
} from "@/client/loader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast, useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "react-query";
import { RerankerConfig } from "./reranker";

const SUPPORTED_FILE_EXTENSIONS = ["txt", "pdf", "csv"];

export const KnowledgeFileSection = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleRemoveFiles(toRemoveFiles: File[], setSubmit?: boolean) {
    console.log("Removing files:", toRemoveFiles);
    if (setSubmit) {
      setIsSubmitting(true);
    }
    setFiles((prevFiles) => {
      return prevFiles.map((f) => {
        if (toRemoveFiles.find((rf) => rf.name === f.name)) {
          return { ...f, status: "toRemove" };
        }
        return f;
      });
    });
    await Promise.all(
      toRemoveFiles.map(async (file) => {
        try {
          await removeFile(file.name);
          return { ...file, status: "removed" };
        } catch (error) {
          toast({
            title: "Failed to remove the file: " + file.name + "!",
            variant: "destructive",
          });
          return { ...file, status: "failed" };
        }
      }),
    );
    // Remove the files from the state no matter the result
    setFiles((prevFiles) => {
      return prevFiles.filter(
        (f) => !toRemoveFiles.find((rf) => rf.name === f.name),
      );
    });
    if (setSubmit) {
      setIsSubmitting(false);
    }
  }

  async function handleAddFiles(addingFiles: globalThis.File[]) {
    const toUploadFiles: File[] = addingFiles.map((file) => ({
      name: file.name,
      status: "toUpload",
      blob: file,
    }));
    setFiles((prevFiles) => [...prevFiles, ...toUploadFiles]);
    return toUploadFiles;
  }

  async function handleUploadFile(toUploadFiles?: File[]) {
    if (!toUploadFiles) {
      toUploadFiles = files.filter((file) => file.status === "toUpload");
    }
    console.log("Uploading files:", toUploadFiles);

    // Change to for loop to upload files one by one
    for (const file of toUploadFiles) {
      const formData = new FormData();
      formData.append("file", file.blob as Blob);
      try {
        await uploadFile(formData);
        setFiles((prevFiles) => {
          return prevFiles.map((f) => {
            if (f.name === file.name) {
              return { ...f, status: "uploaded" };
            }
            return f;
          });
        });
      } catch (err: unknown) {
        console.error(
          "Failed to upload the file:",
          file.name,
          (err as Error)?.message,
        );
        toast({
          title: "Failed to upload the file: " + file.name + "!",
          variant: "destructive",
        });
        setFiles((prevFiles) => {
          return prevFiles.map((f) => {
            if (f.name === file.name) {
              return { ...f, status: "failed" };
            }
            return f;
          });
        });
        await handleRemoveFiles([file], false);
      }
    }
  }

  async function processUpload(blobFiles: globalThis.File[]) {
    // Ignore duplicate files
    const duplicateFiles = files.filter((file) =>
      blobFiles.find((f) => f.name === file.name),
    );
    if (duplicateFiles.length > 0) {
      toast({
        title: `Ignoring duplicate files (${duplicateFiles.map((f) => f.name).join(", ")})!`,
        variant: "destructive",
      });
    }
    // Filter out duplicate files
    const newFiles = blobFiles.filter(
      (file) => !duplicateFiles.find((f) => f.name === file.name),
    );
    if (newFiles.length > 0) {
      setIsSubmitting(true);
      const addedFiles = await handleAddFiles(newFiles);
      await handleUploadFile(addedFiles);
      setIsSubmitting(false);
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
    <div>
      <div className="border-b mb-4 border-gray-300 pt-4 pb-4"></div>
      <div className="space-y-4">
        <UploadFile processUpload={processUpload} isSubmitting={isSubmitting} />
        <ListFiles
          files={files}
          handleRemoveFiles={handleRemoveFiles}
          isSubmitting={isSubmitting}
        />
      </div>
      <div className="border-b mb-2 border-gray-300 pt-4 pb-4"></div>
      <FileLoaderConfig />
      <RerankerConfig />
    </div>
  );
};

const FileLoaderConfig = () => {
  const loaderForm = useForm({
    resolver: zodResolver(FileLoaderSchema),
  });
  const { data: fileLoader, refetch } = useQuery(
    "fileLoader",
    fetchFileLoader,
    {
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (fileLoader) {
      loaderForm.reset(fileLoader);
    }
  }, [fileLoader, loaderForm]);

  const submitLoaderForm = async (data: any) => {
    try {
      await updateFileLoader(data);
      refetch();
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to update file loader configuration!",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Form {...loaderForm}>
        <form
          className="space-y-4 mb-4"
          onBlur={loaderForm.handleSubmit(submitLoaderForm)}
        >
          <FormField
            control={loaderForm.control}
            name="use_llama_parse"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      // Instantly update the form value
                      field.onChange(checked);
                      submitLoaderForm(loaderForm.getValues());
                    }}
                  />
                </FormControl>
                <div>
                  <FormLabel className="font-normal">Use LlamaParse</FormLabel>
                  <FormMessage />
                  <FormDescription>
                    Use LLamaParse to efficiently parse files
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          {loaderForm.watch("use_llama_parse") && (
            <FormField
              control={loaderForm.control}
              name="llama_cloud_api_key"
              render={({ field }) => (
                <FormItem className="ml-6">
                  <FormLabel>LlamaCloud API Key</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the API key for LlamaCloud to use LlamaParse
                  </FormDescription>
                </FormItem>
              )}
            />
          )}
        </form>
      </Form>
    </>
  );
};

const ListFiles = ({
  files,
  handleRemoveFiles,
  isSubmitting,
}: {
  files: File[];
  handleRemoveFiles: (files: File[], setSubmit?: boolean) => Promise<void>;
  isSubmitting: boolean;
}) => {
  return (
    // Show uploaded files in grid layout
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                key={index}
                className={`rounded-lg pl-2 pr-4 border border-gray-300 ${file.status !== "uploaded" ? "bg-gray-300" : "bg-gray-100"}`}
              >
                <div className="flex flex-row justify-between items-center h-10">
                  <div className="text-sm overflow-hidden">
                    {file.name.length > 20
                      ? `${file.name.slice(0, 10)}...${file.name.slice(-10)}`
                      : file.name}
                  </div>
                  <button
                    className="text-gray-500 text-sm w-2"
                    onClick={() => handleRemoveFiles([file])}
                    disabled={isSubmitting}
                  >
                    {file.status === "uploaded" || file.status === "failed" ? (
                      "✖"
                    ) : (
                      <LoaderCircle className="animate-spin w-4" />
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
      ))}
    </div>
  );
};

const UploadFile = ({
  processUpload,
  isSubmitting,
}: {
  processUpload: (files: globalThis.File[]) => Promise<void>;
  isSubmitting: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Input
        ref={inputRef}
        id="upload-knowledge-files"
        type="file"
        style={{ display: "none" }}
        multiple
        onChange={async (e) => {
          await processUpload(Array.from(e.target.files ?? []));
          e.target.value = ""; // Clear the input value
        }}
      />
      <div className="flex items-center space-x-2">
        <Label htmlFor="upload-knowledge-files">
          <Button
            disabled={isSubmitting}
            onClick={(e) => {
              e.preventDefault();
              if (!isSubmitting) {
                inputRef.current?.click();
              }
            }}
          >
            Upload Files
          </Button>
        </Label>
        <span className="font-medium text-sm">
          Supported file types: {SUPPORTED_FILE_EXTENSIONS.join(", ")}
        </span>
      </div>
    </div>
  );
};
