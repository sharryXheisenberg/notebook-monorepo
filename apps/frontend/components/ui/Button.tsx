import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const variants = {
      primary: "bg-annotation text-canvas hover:bg-annotation/90",
      secondary: "border border-border-subtle text-ink-primary hover:bg-surface-raised",
      ghost: "text-ink-muted hover:text-ink-primary hover:bg-surface-raised",
      danger: "bg-red-900/50 text-red-200 hover:bg-red-900/70",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
