import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full px-3 py-2 rounded-md bg-surface border border-border-subtle",
        "text-ink-primary placeholder:text-ink-muted",
        "focus:border-signal focus:ring-1 focus:ring-signal",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
