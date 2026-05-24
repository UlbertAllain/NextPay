import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-blue-600 text-white hover:bg-blue-700",
        variant === "secondary" &&
          "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
        variant === "ghost" &&
          "text-slate-700 hover:bg-slate-100",
        variant === "danger" &&
          "bg-red-600 text-white hover:bg-red-700",
        className
      )}
      {...props}
    />
  );
}