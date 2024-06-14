"use client";

import { useState } from "react";
import { CsvFile } from ".";

export function useCsv() {
  const [files, setFiles] = useState<CsvFile[]>([]);

  const csvEqual = (a: CsvFile, b: CsvFile) => {
    if (a.id === b.id) return true;
    if (a.filename === b.filename && a.filesize === b.filesize) return true;
    return false;
  };

  const upload = (file: CsvFile) => {
    const existedCsv = files.find((f) => csvEqual(f, file));
    if (!existedCsv) {
      setFiles((prev) => [...prev, file]);
      return true;
    }
    return false;
  };

  const remove = (file: CsvFile) => {
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
  };

  const reset = () => {
    setFiles([]);
  };

  return { files, upload, remove, reset };
}
