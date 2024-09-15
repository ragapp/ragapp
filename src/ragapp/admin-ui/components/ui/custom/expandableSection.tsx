import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const ExpandableSection = ({
  name,
  title,
  description,
  open,
  children,
  isLoading,
}: {
  name: string;
  title: string;
  description?: string;
  open?: boolean;
  children: React.ReactNode;
  isLoading?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  // Load the state from local storage when the component mounts
  useEffect(() => {
    const expandable = JSON.parse(
      localStorage.getItem("expandable-sections") || "{}",
    );
    const savedState = expandable ? expandable[name] : undefined;

    if (savedState !== undefined && open === undefined) {
      setIsOpen(savedState === "open");
    } else {
      setIsOpen(open ?? false);
    }
  }, [name, open]);

  // Save the state to local storage whenever it changes
  useEffect(() => {
    if (isOpen !== null) {
      // Get the saved state from local storage
      const expandable = JSON.parse(
        localStorage.getItem("expandable-sections") || "{}",
      );
      // Set the new state
      expandable[name] = isOpen ? "open" : "closed";
      localStorage.setItem("expandable-sections", JSON.stringify(expandable));
    }
  }, [isOpen, name]);

  return (
    <section className="mb-4 rounded-lg p-2 border border-gray-300">
      <header
        className="flex items-center justify-between p-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-secondary-foreground" />
        ) : (
          <span>{isOpen ? <>&#x25BC;</> : <>&#x25B6;</>}</span>
        )}
      </header>
      <div className="border-b mb-2 border-gray-300"></div>
      <div className="z-10 pl-2 max-w-5xl w-full items-center justify-between">
        <p className="text-gray-500 italic">{description}</p>
      </div>
      <div className="z-10 p-4 max-w-5xl w-full items-center justify-between">
        {isOpen && children}
      </div>
    </section>
  );
};

export { ExpandableSection };
