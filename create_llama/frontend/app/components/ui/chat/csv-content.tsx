import { CsvData } from ".";
import UploadCsvPreview from "../upload-csv-preview";

export default function CsvContent({ data }: { data: CsvData }) {
  if (!data.csvFiles.length) return null;
  return (
    <div className="flex gap-2 items-center">
      {data.csvFiles.map((csv, index) => (
        <UploadCsvPreview key={index} csv={csv} />
      ))}
    </div>
  );
}
