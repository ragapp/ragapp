import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
    </Button>
  );
}
