"use client";

import { Button } from "@/components/ui/button";
import { Input, InputProps } from "@/components/ui/input";
import { useCopyToClipboard } from "@/lib/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { Check, Copy, EyeIcon, EyeOffIcon } from "lucide-react";
import { forwardRef, useState } from "react";

const PasswordInput = forwardRef<
  HTMLInputElement,
  InputProps & { showCopy?: boolean; defaultShowPassword?: boolean }
>(({ className, ...props }, ref) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 1000 });
  const [showPassword, setShowPassword] = useState(
    props.defaultShowPassword ?? false,
  );
  const disabled =
    props.value === "" || props.value === undefined || props.disabled;

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("hide-password-toggle pr-10", className)}
        ref={ref}
        {...props}
      />
      <div className="absolute right-0 top-0 h-full flex items-center py-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={disabled}
        >
          {showPassword && !disabled ? (
            <EyeIcon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="sr-only">
            {showPassword ? "Hide password" : "Show password"}
          </span>
        </Button>
        {props.showCopy && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hover:bg-transparent"
            onClick={() => copyToClipboard(props.value as string)}
          >
            {isCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        )}
      </div>
      <style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
				`}</style>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
