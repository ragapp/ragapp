import { useState } from "react";

const ExpandableSection = ({
  title,
  description,
  open,
  children,
}: {
  title: string;
  description?: string;
  open: boolean;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(open ?? true);

  return (
    <section className="mb-4 rounded-lg p-2 border border-gray-300">
      <header
        className="flex items-center justify-between p-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <span>{isOpen ? <>&#x25BC;</> : <>&#x25B6;</>}</span>
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
