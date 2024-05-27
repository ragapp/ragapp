const STORAGE_FOLDER = "data";

export const getStaticFileDataUrl = (filename: string) => {
  const isUsingBackend = !!process.env.NEXT_PUBLIC_CHAT_API;
  const fileUrl = `/api/${STORAGE_FOLDER}/${filename}`;
  if (isUsingBackend) {
    const backendOrigin = new URL(process.env.NEXT_PUBLIC_CHAT_API!).origin;
    return `${backendOrigin}/${fileUrl}`;
  }
  return fileUrl;
};
