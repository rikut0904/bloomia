import { cn } from "@/lib/utils";

export function Button({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "rounded-full px-6 py-3 font-semibold text-lg bg-pink-400 text-white shadow-md hover:bg-pink-500 transition-all",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}