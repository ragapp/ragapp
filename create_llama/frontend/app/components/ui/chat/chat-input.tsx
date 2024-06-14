import { JSONValue } from "ai";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { MessageAnnotation, MessageAnnotationType } from ".";
import { Button } from "../button";
import FileUploader from "../file-uploader";
import { Input } from "../input";
import UploadCsvPreview from "../upload-csv-preview";
import UploadImagePreview from "../upload-image-preview";
import { ChatHandler } from "./chat.interface";
import { useCsv } from "./use-csv";

export default function ChatInput(
  props: Pick<
    ChatHandler,
    | "isLoading"
    | "input"
    | "onFileUpload"
    | "onFileError"
    | "handleSubmit"
    | "handleInputChange"
    | "messages"
    | "setInput"
    | "append"
  >,
) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { files: csvFiles, upload, remove, reset } = useCsv();

  const getAnnotations = () => {
    if (!imageUrl && csvFiles.length === 0) return undefined;
    const annotations: MessageAnnotation[] = [];
    if (imageUrl) {
      annotations.push({
        type: MessageAnnotationType.IMAGE,
        data: { url: imageUrl },
      });
    }
    if (csvFiles.length > 0) {
      annotations.push({
        type: MessageAnnotationType.CSV,
        data: {
          csvFiles: csvFiles.map((file) => ({
            id: file.id,
            content: file.content,
            filename: file.filename,
            filesize: file.filesize,
          })),
        },
      });
    }
    return annotations as JSONValue[];
  };

  // default submit function does not handle including annotations in the message
  // so we need to use append function to submit new message with annotations
  const handleSubmitWithAnnotations = (
    e: React.FormEvent<HTMLFormElement>,
    annotations: JSONValue[] | undefined,
  ) => {
    e.preventDefault();
    props.append!({
      content: props.input,
      role: "user",
      createdAt: new Date(),
      annotations,
    });
    props.setInput!("");
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const annotations = getAnnotations();
    if (annotations) {
      handleSubmitWithAnnotations(e, annotations);
      imageUrl && setImageUrl(null);
      csvFiles.length && reset();
      return;
    }
    props.handleSubmit(e);
  };

  const onRemovePreviewImage = () => setImageUrl(null);

  const handleUploadImageFile = async (file: File) => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
    setImageUrl(base64);
  };

  const handleUploadCsvFile = async (file: File) => {
    const content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
    const isSuccess = upload({
      id: uuidv4(),
      content,
      filename: file.name,
      filesize: file.size,
    });
    if (!isSuccess) {
      alert("File already exists in the list.");
    }
  };

  const handleUploadFile = async (file: File) => {
    try {
      if (file.type.startsWith("image/")) {
        return await handleUploadImageFile(file);
      }
      if (file.type === "text/csv") {
        if (csvFiles.length > 0) {
          alert("You can only upload one csv file at a time.");
          return;
        }
        return await handleUploadCsvFile(file);
      }
      props.onFileUpload?.(file);
    } catch (error: any) {
      props.onFileError?.(error.message);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl bg-white p-4 shadow-xl space-y-4"
    >
      {imageUrl && (
        <UploadImagePreview url={imageUrl} onRemove={onRemovePreviewImage} />
      )}
      {csvFiles.length > 0 && (
        <div className="flex gap-4 w-full overflow-auto py-2">
          {csvFiles.map((csv) => {
            return (
              <UploadCsvPreview
                key={csv.id}
                csv={csv}
                onRemove={() => remove(csv)}
              />
            );
          })}
        </div>
      )}
      <div className="flex w-full items-start justify-between gap-4 ">
        <Input
          autoFocus
          name="message"
          placeholder="Type a message"
          className="flex-1"
          value={props.input}
          onChange={props.handleInputChange}
        />
        <FileUploader
          onFileUpload={handleUploadFile}
          onFileError={props.onFileError}
        />
        <Button type="submit" disabled={props.isLoading || !props.input.trim()}>
          Send message
        </Button>
      </div>
    </form>
  );
}
