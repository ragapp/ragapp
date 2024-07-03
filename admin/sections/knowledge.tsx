import { File, fetchFiles, removeFile, uploadFile } from "@/client/files";
import { getLlamaCloudConfig, updateLlamaCloudConfig } from "@/client/llamacloud";
import { Button } from "@/components/ui/button";
import { ExpandableSection } from "@/components/ui/custom/expandableSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Edit, ExternalLink, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import {
  LlamaCloudConfigDialog,
  LlamaCloudConfigForm,
} from "./config/llamacloud";
import { FileLoaderConfig } from "./fileLoader";
import { useForm } from "react-hook-form";

export const Knowledge = () => {
  const [ files, setFiles ] = useState<File[]>([]);
  const { toast } = useToast();
  const [ isSubmitting, setIsSubmitting ] = useState(false);

  const [ llamacloudDialogOpen, setLlamacloudDialogOpen ] = useState(false);
  const { data, refetch } = useQuery("LlamaCloudConfig", getLlamaCloudConfig, {
    refetchOnWindowFocus: false,
  });
  const { mutate: updateConfig } = useMutation(
    updateLlamaCloudConfig,
    {
      onError: (error: unknown) => {
        console.error(error);
        toast({
          title: "Failed to update chat config",
          variant: "destructive",
        });
        form.reset();
      },
      onSuccess: () => {
        setLlamacloudDialogOpen(false);
        refetch();
      },
    },
  );
  const form = useForm({
    values: data,
  });
  const useLlamaCloud = !!data?.use_llama_cloud;

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
    setFiles((prevFiles) => [ ...prevFiles, ...toUploadFiles ]);
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
        await handleRemoveFiles([ file ], false);
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
  }, [ toast ]);

  const onCheckedChange = (checked: boolean) => {
    if (checked) {
      setLlamacloudDialogOpen(true);
    } else {
      updateConfig({ use_llama_cloud: false });
    }
  }

  return (
    <ExpandableSection
      name="knowledge"
      title={"Knowledge"}
      description="Manage your own data to chat with. You can consider using LlamaCloud for hosting your data."
      open
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            checked={useLlamaCloud}
            onCheckedChange={onCheckedChange}
            id="use-llamacloud"
          />
          <Label htmlFor="use-llamacloud">Use LlamaCloud</Label>
        </div>
        {useLlamaCloud && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setLlamacloudDialogOpen(true)}
          >
            Edit Configuration
            <Edit className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {useLlamaCloud && (
        <div className="space-y-4">
          <LlamaCloudConfigForm form={form} viewOnly />
          <div className="space-y-2 mt-2">
            <div className="font-medium">
              Success connected to LlamaCloud 🎉
            </div>
            <Button
              asChild
              className="bg-green-500 hover:bg-green-600"
              size="sm"
            >
              <a href="#" target="_blank">
                Configure Data Sources <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      )}
      {!useLlamaCloud && (
        <div>
          <div className="border-b mb-2 border-gray-300 pt-4 pb-4"></div>
          <h4 className="text-lg font-semibold mb-4">Upload files to RagApp</h4>
          <div className="space-y-4">
            <UploadFile
              processUpload={processUpload}
              isSubmitting={isSubmitting}
            />
            <ListFiles
              files={files}
              handleRemoveFiles={handleRemoveFiles}
              isSubmitting={isSubmitting}
            />
          </div>
          <div className="border-b mb-2 border-gray-300 pt-4 pb-4"></div>
          <FileLoaderConfig />
        </div>
      )}
      <LlamaCloudConfigDialog
        open={llamacloudDialogOpen}
        setOpen={setLlamacloudDialogOpen}
        defaultConfig={data}
        refetch={refetch}
      />
    </ExpandableSection>
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
                    onClick={() => handleRemoveFiles([ file ])}
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
    </div>
  );
};
