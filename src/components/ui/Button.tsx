import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "whatsapp";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
      secondary: "bg-slate-900 text-white hover:bg-slate-800",
      outline: "border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50",
      ghost: "text-slate-700 hover:bg-slate-100",
      danger: "bg-red-600 text-white hover:bg-red-700",
      whatsapp: "bg-[#25D366] text-white hover:bg-[#1ebe57] shadow-sm",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-sm font-medium",
      lg: "px-6 py-3 text-base font-semibold",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
