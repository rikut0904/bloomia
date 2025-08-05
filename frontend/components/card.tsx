import { cn } from "@/lib/utils";
import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({
    children,
    className,
    variant = 'default',
    ...props
}: CardProps) {
    const variantClasses = {
        default: "bg-white dark:bg-gray-800 shadow-sm",
        elevated: "bg-white dark:bg-gray-800 shadow-lg",
        outlined: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
    };

    return (
        <div
            className={cn(
                "rounded-lg p-4",
                variantClasses[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardContent({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("p-2", className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("p-4 pb-2", className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardFooter({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("p-4 pt-2", className)}
            {...props}
        >
            {children}
        </div>
    );
}