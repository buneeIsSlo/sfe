"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";
import { ChevronUp } from "lucide-react";
import { useScrollToTopContext } from "@/components/scroll-to-top";
export type ScrollButtonProps = {
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
function ScrollButton({
  className,
  variant = "default",
  size = "sm",
  ...props
}: ScrollButtonProps) {
  const { isAtTop, scrollToTop } = useScrollToTopContext();
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "size-8 rounded-full border-2 shadow-lg transition-all duration-300 ease-in-out md:size-10",
        isAtTop
          ? "pointer-events-none translate-y-4 scale-95 opacity-0"
          : "translate-y-0 scale-100 opacity-100",
        className,
      )}
      onClick={() => scrollToTop()}
      {...props}
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  );
}
export { ScrollButton };
