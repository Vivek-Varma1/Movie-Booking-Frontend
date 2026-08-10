import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent text-sm font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out outline-none select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-brand-secondary text-surface-background hover:bg-brand-premium active:bg-brand-primary focus-visible:shadow-[0_0_0_4px_rgba(1,69,242,0.18)]",
        outline:
          "border-border bg-transparent text-brand-secondary hover:border-brand-premium hover:bg-brand-secondary/12 hover:text-brand-premium",
        secondary:
          "border border-border bg-surface-secondary text-white-soft hover:border-brand-secondary hover:bg-surface-hover hover:text-foreground",
        ghost:
          "text-white-soft hover:bg-surface-hover hover:text-foreground",
        destructive:
          "bg-error text-white hover:bg-brand-primary",
        link: "text-info underline-offset-4 hover:text-brand-secondary hover:underline",
      },
      size: {
        default: "h-9 gap-1.5 px-3",
        sm: "h-7 gap-1 px-2.5 text-xs",
        lg: "h-11 gap-2 px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      data-slot="button"
      data-primary-cta={variant === "default" ? "true" : undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
