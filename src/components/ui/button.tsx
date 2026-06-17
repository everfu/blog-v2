import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border text-sm font-medium outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-primary bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20',
        outline: 'border-border bg-background text-foreground hover:bg-muted',
        secondary: 'border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'border-transparent bg-transparent text-foreground hover:bg-muted',
        link: 'border-transparent bg-transparent text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-8 px-3',
        xs: 'h-6 px-2 text-xs',
        sm: 'h-7 px-2.5 text-xs',
        lg: 'h-9 px-3',
        icon: 'h-8 w-8 p-0',
        'icon-xs': 'h-6 w-6 p-0',
        'icon-sm': 'h-7 w-7 p-0',
        'icon-lg': 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
