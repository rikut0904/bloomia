import { cn } from "@/lib/utils";

export function Card({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("rounded-xl bg-white p-4 shadow", className)}>{children}</div>;
}

export function CardContent({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-2", className)}>{children}</div>;
}