import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "border-primary bg-primary px-4 text-primary-foreground hover:bg-primary/90",
        secondary: "border-border bg-card px-4 text-foreground hover:bg-muted",
        ghost: "border-transparent bg-transparent px-3 text-muted-foreground hover:bg-muted hover:text-foreground",
        icon: "size-10 border-border bg-card text-foreground hover:bg-muted",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant }), className)} {...props} />;
}
