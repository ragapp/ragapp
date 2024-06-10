import { Input, InputProps } from "@/components/ui/input";
import { XIcon, PlusIcon } from "lucide-react";
import { Dispatch, SetStateAction, forwardRef, useEffect, useRef, useState } from "react";

type InputElementsProps = InputProps & {
    value: string[];
    onChange: Dispatch<SetStateAction<string[]>>;
};

export const MultipleInputs = forwardRef<HTMLInputElement, InputElementsProps>(
    ({ value, onChange, ...props }, ref) => {
        useEffect(() => {
            // Ensure there's at least one input if the initial value is null or undefined
            if (!value || value.length === 0) {
                onChange([""]);
            }
        }, [value, onChange]);

        const handleInputChange = (newValue: string, index: number) => {
            const newValues = [...value];
            newValues[index] = newValue;
            onChange(newValues);
        };

        const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>, index: number) => {
            const newValue = e.target.value.trim();
            handleInputChange(newValue, index);
        };

        const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
            if (e.key === "Enter" && index === value.length - 1) {
                e.preventDefault();
                onChange([...value, ""]);
            } else if (e.key === "Backspace" && value[index] === "" && index > 0) {
                const newValues = [...value];
                newValues.splice(index, 1);
                onChange(newValues);
            }
        };

        const handleDeleteInput = (index: number) => {
            if (value.length > 1) {
                const newValues = [...value];
                newValues.splice(index, 1);
                onChange(newValues);
            }
        };

        const handleAddInput = (index: number) => {
            const newValues = [...value];
            newValues.splice(index + 1, 0, "");
            onChange(newValues);
        };

        const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

        return (
            <>
                {value && value.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex flex-row w-full p-2 justify-between items-center relative"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <Input
                            value={item}
                            onChange={(e) => handleInputChange(e.target.value, idx)}
                            onBlur={(e) => handleInputBlur(e, idx)}
                            onKeyDown={(e) => handleInputKeyDown(e, idx)}
                            className="border border-gray-300 rounded-md px-2 py-1"
                            autoFocus={idx === value.length - 1} // Autofocus on the last input
                            {...props}
                            ref={ref}
                        />
                        {hoveredIndex === idx && ( // Display buttons on hover for each input
                            <>
                                <button
                                    type="button"
                                    className="absolute right-8 top-1/2 transform -translate-y-1/2 w-3"
                                    onClick={() => handleDeleteInput(idx)}
                                >
                                    <span className="sr-only">Delete</span>
                                    <XIcon className="w-3" strokeWidth={5} />
                                </button>
                                <button
                                    type="button"
                                    className="absolute right-16 top-1/2 transform -translate-y-1/2 w-3"
                                    onClick={() => handleAddInput(idx)}
                                >
                                    <span className="sr-only">Add</span>
                                    <PlusIcon className="w-3" strokeWidth={5} />
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </>
        );
    }
);
