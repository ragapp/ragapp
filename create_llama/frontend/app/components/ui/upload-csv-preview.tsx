import { XCircleIcon } from "lucide-react";
import Image from "next/image";
import SheetIcon from "../ui/icons/sheet.svg";
import { Button } from "./button";
import { CsvFile } from "./chat";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import { cn } from "./lib/utils";

export interface UploadCsvPreviewProps {
  csv: CsvFile;
  onRemove?: () => void;
}

export default function UploadCsvPreview(props: UploadCsvPreviewProps) {
  const { filename, filesize, content } = props.csv;
  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <div>
          <CSVSummaryCard {...props} />
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-3/5 mt-24 h-full max-h-[96%] ">
        <DrawerHeader className="flex justify-between">
          <div className="space-y-2">
            <DrawerTitle>Csv Raw Content</DrawerTitle>
            <DrawerDescription>
              {filename} ({inKB(filesize)} KB)
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="m-4 max-h-[80%] overflow-auto">
          <pre className="bg-secondary rounded-md p-4 block text-sm">
            {content}
          </pre>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function CSVSummaryCard(props: UploadCsvPreviewProps) {
  const { onRemove, csv } = props;
  return (
    <div className="p-2 w-60 max-w-60 bg-secondary rounded-lg text-sm relative cursor-pointer">
      <div className="flex flex-row items-center gap-2">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
          <Image
            className="h-full w-auto"
            priority
            src={SheetIcon}
            alt="SheetIcon"
          />
        </div>
        <div className="overflow-hidden">
          <div className="truncate font-semibold">
            {csv.filename} ({inKB(csv.filesize)} KB)
          </div>
          <div className="truncate text-token-text-tertiary flex items-center gap-2">
            <span>Spreadsheet</span>
          </div>
        </div>
      </div>
      {onRemove && (
        <div
          className={cn(
            "absolute -top-2 -right-2 w-6 h-6 z-10 bg-gray-500 text-white rounded-full",
          )}
        >
          <XCircleIcon
            className="w-6 h-6 bg-gray-500 text-white rounded-full"
            onClick={onRemove}
          />
        </div>
      )}
    </div>
  );
}

function inKB(size: number) {
  return Math.round((size / 1024) * 10) / 10;
}
