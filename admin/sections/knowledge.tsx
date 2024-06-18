import {
  File,
  FileStatus,
  fetchFiles,
  removeFile,
  uploadFile,
  FileObject,
  FilesState,
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
import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({ host: "localhost", port: 6333 });

export const Knowledge = () => {
  const [files, setFiles] = useState<FilesState>({});
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [collections, setCollections] = useState<string[]>([]);
  const [loadingCollections, setLoadingCollections] = useState<boolean>(false);
  const [errorLoadingCollections, setErrorLoadingCollections] = useState<boolean>(false);
  const [creatingCollection, setCreatingCollection] = useState<boolean>(false);
  const [newCollectionName, setNewCollectionName] = useState<string>('');
  const { toast } = useToast();



  const updateStatus = (name: string, status: FileStatus) => (f: File) => {
    if (f.name === name) {
      return { ...f, status };
    }
    return f;
  };

  
  async function handleRemoveFile(collectionName: string, file: FileObject) {
    setFiles((prevFiles) => {
      const updatedFiles = { ...prevFiles };
      updatedFiles[collectionName] = updatedFiles[collectionName].map((f) =>
        f.name === file.name ? { ...f, status: "removing" } : f
      );
      return updatedFiles;
    });
  
    try {
      await removeFile(collectionName, file.name);
      setFiles((prevFiles) => {
        const updatedFiles = { ...prevFiles };
        updatedFiles[collectionName] = updatedFiles[collectionName].filter(
          (f) => f.name !== file.name
        );
        return updatedFiles;
      });
    } catch (error) {
      console.error("Failed to remove file:", error);
      setFiles((prevFiles) => {
        const updatedFiles = { ...prevFiles };
        updatedFiles[collectionName] = updatedFiles[collectionName].map((f) =>
          f.name === file.name ? { ...f, status: "failed" } : f
        );
        return updatedFiles;
      });
    }
  }

  
  async function handleAddFiles(collectionName: string, addingFiles: any[]) {
    for (const file of addingFiles) {
      const fileObj = {
        name: file.name,
        status: "uploading" as FileStatus,
      };
  
      setFiles((prevFiles) => {
        const updatedFiles = { ...prevFiles };
        if (!updatedFiles[collectionName]) {
          updatedFiles[collectionName] = [];
        }
        updatedFiles[collectionName].push(fileObj);
        return updatedFiles;
      });
  
      const formData = new FormData();
      formData.append("file", file);
  
      try {
        await uploadFile(collectionName, formData);
        setFiles((prevFiles) => {
          const updatedFiles = { ...prevFiles };
          updatedFiles[collectionName] = updatedFiles[collectionName].map(f => 
            f.name === fileObj.name ? { ...f, status: "uploaded" } : f
          );
          return updatedFiles;
        });
      } catch (err: unknown) {
        setFiles((prevFiles) => {
          const updatedFiles = { ...prevFiles };
          updatedFiles[collectionName] = updatedFiles[collectionName].map(f => 
            f.name === fileObj.name ? { ...f, status: "failed" } : f
          );
          return updatedFiles;
        });
        console.error("Failed to upload the file:", file.name, (err as Error)?.message);
        toast({
          className: cn("top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 text-red-500"),
          title: "Failed to upload the file: " + file.name + "!",
        });
      }
    }
  }

  useEffect(() => {
    async function handleFetchFiles() {
      if (!selectedCollection) return; // Do not fetch if no collection is selected

      try {
        const files: FileObject[] = await fetchFiles(selectedCollection);
        setFiles((prevFiles) => ({
          ...prevFiles,
          [selectedCollection]: files,
        }));
      } catch (error) {
        console.error("Failed to fetch files:", error);
        toast({
          className: cn("top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 text-red-500"),
          title: "Failed to load uploaded files!",
        });
      }
    }

    handleFetchFiles();
  }, [selectedCollection, toast]); // Run effect when selectedCollection or toast changes



  const fetchCollections = async () => {
    setLoadingCollections(true);
    setErrorLoadingCollections(false);
    try {
      const collectionsResponse = await client.getCollections();
      const collectionNames = collectionsResponse.collections.map((collection: { name: string }) => collection.name);
      setCollections(collectionNames);
      setSelectedCollection(collectionNames[0] || ''); // Set default selected collection if available
    } catch (error) {
      console.error("Failed to fetch collections:", error);
      setErrorLoadingCollections(true);
    } finally {
      setLoadingCollections(false);
    }
  };

  const sendSelectedCollection = async (collectionName: string) => {
    try {
      const response = await fetch('/api/management/set-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collection_name: collectionName }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to send selected collection');
      }
  
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Error sending selected collection:', error);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);
  
  useEffect(() => {
    if (selectedCollection) {
      sendSelectedCollection(selectedCollection);
    }
  }, [selectedCollection]);
  
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCollection(event.target.value);
  };

const handleCreateCollection = async () => {
  if (!newCollectionName.trim()) {
    toast({
      className: cn(
        "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 text-red-500",
      ),
      title: "Collection name cannot be empty!",
    });
    return;
  }

  setCreatingCollection(true);
  try {
    await client.createCollection(newCollectionName, {
      vectors: { size: 768, distance: "Cosine" },
    });
    toast({
      className: cn(
        "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 text-green-500",
      ),
      title: `Collection "${newCollectionName}" created successfully!`,
    });
    setNewCollectionName('');
    fetchCollections(); // Refresh collections after creation
  } catch (error) {
    console.error("Failed to create collection:", error);
    toast({
      className: cn(
        "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 text-red-500",
      ),
      title: `Failed to create collection "${newCollectionName}"!`,
    });
  } finally {
    setCreatingCollection(false);
  }
};

return (
  <ExpandableSection
    title={"Knowledge"}
    description="Upload your own data to chat with"
    open
  >
    <div className="grid mt-5 w-full max-w-sm items-center gap-1.5">
      <Label>Create Collection</Label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter collection name"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
          onClick={handleCreateCollection}
          disabled={creatingCollection}
        >
          {creatingCollection ? 'Creating...' : 'Create'}
        </button>
      </div>
    </div>
    <div className="grid mt-5 w-full max-w-sm items-center gap-1.5">
      <Label>Select Collection</Label>
      {loadingCollections ? (
        <p>Loading collections...</p>
      ) : errorLoadingCollections ? (
        <p>Error loading collections</p>
      ) : (
        <select
          value={selectedCollection}
          onChange={handleSelectChange}
          className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {collections.map((collection, index) => (
            <option key={index} value={collection}>
              {collection}
            </option>
          ))}
        </select>
      )}
    </div>
    <ListFiles 
      files={files[selectedCollection] || []} 
      collectionName={selectedCollection} 
      handleRemoveFile={handleRemoveFile} 
    />
    <UploadFile 
      collectionName={selectedCollection} 
      handleAddFiles={handleAddFiles} 
    />
  </ExpandableSection>
);

};


const ListFiles = ({
  files,
  collectionName,
  handleRemoveFile,
}: {
  files: FileObject[];
  collectionName: string;
  handleRemoveFile: (collectionName: string, file: FileObject) => void;
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
                        onClick={() => handleRemoveFile(collectionName, file)}
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


const UploadFile = ({ collectionName, handleAddFiles }: { collectionName: string, handleAddFiles: (collectionName: string, files: any[]) => Promise<void> }) => {
  return (
    <div className="grid mt-10 w-full max-w-sm items-center gap-1.5">
      <Label>Upload File</Label>
      <Input
        type="file"
        multiple
        onChange={async (e) => {
          await handleAddFiles(collectionName, Array.from(e.target.files ?? []));
          e.target.value = ""; // Clear the input value
        }}
      />
    </div>
  );
};


const CollectionSelector = ({
  collections,
  selectedCollection,
  setSelectedCollection,
}: {
  collections: string[];
  selectedCollection: string;
  setSelectedCollection: (collection: string) => void;
}) => {
  return (
    <select
      value={selectedCollection}
      onChange={(e) => setSelectedCollection(e.target.value)}
      className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
      {collections.map((collection, index) => (
        <option key={index} value={collection}>
          {collection}
        </option>
      ))}
    </select>
  );
};