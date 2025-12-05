import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap select-none text-sm font-semibold focus-visible:outline-dotted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default: 'win95-btn',
        subtle: 'win95-btn bg-[#f5f5f5]',
        ghost: 'border border-dashed border-[#404040] bg-transparent text-[#111] shadow-none',
        outline: 'border-2 border-[#404040] border-t-[#fefefe] border-l-[#fefefe] bg-transparent text-[#111]',
        taskbar: 'bg-[var(--taskbar-accent)] text-white border border-[#000] border-t-[#1c1c1c] border-left-[#1c1c1c] shadow-[inset_-1px_-1px_0_#00000055]'
      },
      size: {
        default: 'h-10 px-6',
        sm: 'h-8 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10 p-0'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
