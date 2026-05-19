import { cn } from "@/lib/utils"
import Image from "next/image"

interface AvatarProps {
  src?: string | null
  alt: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function Avatar({ src, alt, size = "md", className }: AvatarProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
    xl: "h-20 w-20",
  }

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
    xl: "text-2xl",
  }

  const pixelSizes = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  }

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-accent text-accent-foreground font-medium",
          sizes[size],
          textSizes[size],
          className
        )}
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-muted",
        sizes[size],
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={pixelSizes[size]}
        height={pixelSizes[size]}
        className="object-cover w-full h-full"
      />
    </div>
  )
}